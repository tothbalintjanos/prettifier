import { RequestError } from "@octokit/request-error"
import webhooks from "@octokit/webhooks"
import * as probot from "probot"
import * as probotKit from "probot-kit"
import { applyPrettierConfigOverrides } from "./apply-prettier-config-overrides"
import { concatToSet } from "./concat-to-set"
import { createCommit } from "./create-commit"
import { createPullRequest } from "./create-pull-request"
import { formatCommitMessage } from "./format-commit-message"
import { isDifferentText } from "./is-different-text"
import { loadPrettierConfig } from "./load-prettier-config"
import { loadPrettifierConfiguration } from "./load-prettifier-configuration"
import { prettify } from "./prettify"
import { getPullRequestForBranch } from "./get-pull-request-for-branch"
import { addComment } from "./create-comment"
import { hasCommentFromPrettifier } from "./has-comment-from-prettifier"

// called when this bot gets notified about a push on Github
export async function onPush(context: probot.Context<webhooks.WebhookPayloadPush>) {
  const orgName = context.payload.repository.owner.login
  const repoName = context.payload.repository.name
  const branchName = context.payload.ref.replace("refs/heads/", "")
  const authorName = context.payload.pusher.name
  const commitSha = context.payload.after.substring(0, 7)
  const repoPrefix = `${orgName}/${repoName}|${branchName}|${commitSha}`

  // ignore deleted branches
  if (commitSha === "0000000") {
    console.log(`${repoPrefix}: IGNORING BRANCH DELETION`)
    return
  }

  // log push detected
  console.log(`${repoPrefix}: PUSH DETECTED`)

  // ignore commits by Prettifier
  if (authorName === "prettifier[bot]") {
    console.log(`${repoPrefix}: IGNORING COMMIT BY PRETTIFIER`)
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

  // check pull requests
  if (prettifierConfig.pullsOnly) {
    const pullRequestNumber = await getPullRequestForBranch(orgName, repoName, branchName, context.github)
    if (!pullRequestNumber) {
      console.log(`${repoPrefix}: IGNORING THIS BRANCH BECAUSE IT HAS NO OPEN PULL REQUEST`)
      return
    }
    console.log(`${repoPrefix}: THIS BRANCH HAS PULL REQUEST #${pullRequestNumber}`)
  }

  // load Prettier configuration
  const prettierConfig = await loadPrettierConfig(orgName, repoName, branchName, context.github)

  // find all changed files
  const changedFiles = new Set<string>()
  for (const commit of context.payload.commits) {
    concatToSet(changedFiles, commit.added)
    concatToSet(changedFiles, commit.modified)
    // TODO: remove deleted files here
  }

  // prettify all changed files
  const prettifiedFiles = []
  let i = 0
  for (const file of changedFiles) {
    i++
    const filePrefix = `${repoPrefix}: FILE ${i}/${changedFiles.size} (${file})`

    // ignore non-prettifiable files
    const allowed = await prettifierConfig.shouldPrettify(file)
    if (!allowed) {
      console.log(`${filePrefix} - NON-PRETTIFYABLE`)
      continue
    }

    // load the file content
    const fileData = await probotKit.loadFile(file, context)

    // prettify the file
    const prettierConfigForFile = applyPrettierConfigOverrides(prettierConfig, file)
    const formatted = prettify(fileData.content, file, prettierConfigForFile)

    // ignore if there are no changes
    if (!isDifferentText(formatted, fileData.content)) {
      console.log(`${filePrefix} - ALREADY FORMATTED`)
      continue
    }

    // store the prettified content
    prettifiedFiles.push({ path: file, content: formatted })
    console.log(`${filePrefix} - PRETTIFYING`)
  }

  if (prettifiedFiles.length === 0) {
    // no changed files --> nothing else to do here
    console.log(`${repoPrefix}: ALL FILES ALREADY FORMATTED`)
    return
  }

  // try creating a commit
  let err = null
  try {
    await createCommit({
      branch: branchName,
      github: context.github,
      files: prettifiedFiles,
      message: formatCommitMessage(prettifierConfig.commitMessage, commitSha),
      org: orgName,
      repo: repoName
    })
    console.log(`${repoPrefix}: COMMITTED ${prettifiedFiles.length} PRETTIFIED FILES`)
  } catch (e) {
    err = e
  }

  if (!err && prettifierConfig.commentTemplate !== "") {
    const pullRequestNumber = await getPullRequestForBranch(orgName, repoName, branchName, context.github)
    if (pullRequestNumber > 0) {
      const hasComment = await hasCommentFromPrettifier(orgName, repoName, pullRequestNumber, context.github)
      if (!hasComment) {
        addComment(
          orgName,
          repoName,
          pullRequestNumber,
          formatCommitMessage(prettifierConfig.commentTemplate, commitSha),
          context.github
        )
      } else {
        console.log(`${repoPrefix}: PULL REQUEST ALREADY HAS COMMENT, SKIPPING`)
      }
    }
  }

  if (!err) {
    return
  }

  // When reaching this, the pull request has failed.
  // Analyze the error to see if we should try creating a pull request.
  let tryPullRequest = false
  if (err.constructor.name === "RequestError") {
    const requestError = err as RequestError
    if (requestError.status === 422 && requestError.message.includes("Required status check")) {
      tryPullRequest = true
    }
  }
  if (!tryPullRequest) {
    console.log(`${repoPrefix}: CANNOT COMMIT CHANGES WITH UNKNOWN ERROR:`)
    console.log(err)
    return
  }

  // try creating a pull request
  try {
    await createPullRequest({
      body: "Formats recently committed files. No content changes.",
      branch: `prettifier-${commitSha}`,
      github: context.github,
      files: prettifiedFiles,
      message: formatCommitMessage(prettifierConfig.commitMessage, commitSha),
      org: orgName,
      parentBranch: "master",
      repo: repoName
    })
    console.log(`${repoPrefix}: CREATED PULL REQUEST FOR ${prettifiedFiles.length} PRETTIFIED FILES`)
  } catch (e) {
    console.log(`${repoPrefix}: CANNOT CREATE PULL REQUEST:`)
    console.log(e)
  }
}
