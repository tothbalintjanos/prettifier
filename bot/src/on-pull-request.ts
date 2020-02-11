import * as probot from "probot"
import webhooks from "@octokit/webhooks"
import { loadFile } from "./load-file"
import { getExistingFilesInPullRequests } from "./get-existing-files-in-pull-request"
import { formatCommitMessage } from "./format-commit-message"
import { createCommit } from "./create-commit"
import { loadPrettifierConfiguration } from "./load-prettifier-configuration"
import { loadPrettierConfig } from "./load-prettier-config"
import { applyPrettierConfigOverrides } from "./apply-prettier-config-overrides"
import { prettify } from "./prettify"
import { isDifferentText } from "./is-different-text"
import { addComment } from "./create-comment"

// called when this bot gets notified about a new pull request
export async function onPullRequest(context: probot.Context<webhooks.WebhookPayloadPullRequest>) {
  const orgName = context.payload.repository.owner.login
  const repoName = context.payload.repository.name
  const branchName = context.payload.pull_request.head.ref
  const pullRequestNumber = context.payload.pull_request.number
  const repoPrefix = `${orgName}/${repoName}|#${pullRequestNumber}`

  console.log(`${repoPrefix}: PULL REQUEST DETECTED`)
  if (context.payload.action !== "opened") {
    console.log(`${repoPrefix}: PULL REQUEST ACTION IS ${context.payload.action}, IGNORING`)
    return
  }

  // load Prettifier configuration
  const prettifierConfig = await loadPrettifierConfiguration(orgName, repoName, branchName, context.github)
  console.log(`${repoPrefix}: BOT CONFIG: ${JSON.stringify(prettifierConfig)}`)

  // check whether this branch should be ignored
  if (prettifierConfig.shouldIgnoreBranch(branchName)) {
    console.log(`${repoPrefix}: IGNORING THIS BRANCH PER BOT CONFIG`)
    return
  }

  // load Prettier configuration
  const prettierConfig = await loadPrettierConfig(orgName, repoName, branchName, context.github)

  // load the files that this PR changes
  const files = await getExistingFilesInPullRequests(orgName, repoName, pullRequestNumber, context.github)
  const prettifiedFiles = []
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]
    const filePrefix = `${repoPrefix}: FILE ${i + 1}/${files.length} (${filePath})`

    // ignore files that shouldn't be prettified
    const shouldPrettify = await prettifierConfig.shouldPrettify(filePath)
    if (!shouldPrettify) {
      console.log(`${filePrefix} - IGNORING`)
      continue
    }

    // load the file content
    const fileContent = await loadFile(orgName, repoName, branchName, filePath, context.github)

    // prettify the file content
    const prettierConfigForFile = applyPrettierConfigOverrides(prettierConfig, filePath)
    const formatted = prettify(fileContent, filePath, prettierConfigForFile)

    // ignore if there are no changes
    if (!isDifferentText(formatted, fileContent)) {
      console.log(`${filePrefix} - ALREADY FORMATTED`)
      continue
    }

    // store the prettified content
    prettifiedFiles.push({ path: filePath, content: formatted })
    console.log(`${filePrefix} - PRETTIFYING`)
  }

  if (prettifiedFiles.length === 0) {
    // no changed files --> nothing else to do here
    console.log(`${repoPrefix}: ALL ${files.length} FILES WERE ALREADY FORMATTED`)
    return
  }

  // create a commit
  try {
    await createCommit({
      branch: branchName,
      github: context.github,
      files: prettifiedFiles,
      message: formatCommitMessage(prettifierConfig.commitMessage, `#${pullRequestNumber}`),
      org: orgName,
      repo: repoName
    })
    console.log(`${repoPrefix}: COMMITTED ${prettifiedFiles.length} PRETTIFIED FILES`)
  } catch (e) {
    console.log(`${repoPrefix}: Cannot create commit:`, e)
    return
  }

  // add comment
  if (prettifierConfig.commentTemplate !== "") {
    await addComment(orgName, repoName, pullRequestNumber, prettifierConfig.commentTemplate, context.github)
    console.log(`${repoPrefix}: ADDED COMMENT`)
  }
}
