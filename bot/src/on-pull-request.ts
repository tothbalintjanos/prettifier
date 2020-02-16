import * as probot from "probot"
import webhooks from "@octokit/webhooks"
import { loadFile } from "./github/load-file"
import { getExistingFilesInPullRequests } from "./github/get-existing-files-in-pull-request"
import { formatCommitMessage } from "./template/format-commit-message"
import { createCommit } from "./github/create-commit"
import { loadPrettifierConfiguration } from "./config/load-prettifier-configuration"
import { loadPrettierConfig } from "./prettier/load-prettier-config"
import { applyPrettierConfigOverrides } from "./prettier/apply-prettier-config-overrides"
import { prettify } from "./prettier/prettify"
import { addComment } from "./github/create-comment"
import { devError, logDevError } from "./logging/dev-error"
import { LoggedError } from "./logging/logged-error"
import util from "util"
import { RequestError } from "@octokit/request-error"
import { isConfigurationFile } from "./config/is-configuration-file"

/** called when this bot gets notified about a new pull request */
export async function onPullRequest(context: probot.Context<webhooks.WebhookPayloadPullRequest>) {
  let orgName = ""
  let repoName = ""
  let branchName = ""
  let pullRequestNumber = 0
  try {
    orgName = context.payload.repository.owner.login
    repoName = context.payload.repository.name
    branchName = context.payload.pull_request.head.ref
    pullRequestNumber = context.payload.pull_request.number
    const repoPrefix = `${orgName}/${repoName}|#${pullRequestNumber}`
    console.log(`${repoPrefix}: PULL REQUEST DETECTED`)
    if (context.payload.action !== "opened") {
      console.log(`${repoPrefix}: PULL REQUEST ACTION IS ${context.payload.action}, IGNORING`)
      return
    }

    // load Prettifier configuration
    const prettifierConfig = await loadPrettifierConfiguration(
      orgName,
      repoName,
      branchName,
      pullRequestNumber,
      context.github
    )
    console.log(`${repoPrefix}: BOT CONFIG: ${JSON.stringify(prettifierConfig)}`)

    // check whether this branch should be ignored
    if (prettifierConfig.shouldIgnoreBranch(branchName)) {
      console.log(`${repoPrefix}: IGNORING THIS BRANCH PER BOT CONFIG`)
      return
    }

    // load Prettier configuration
    const prettierConfig = await loadPrettierConfig(
      orgName,
      repoName,
      branchName,
      pullRequestNumber,
      prettifierConfig,
      context.github
    )

    // load the files that this PR changes
    const files = await getExistingFilesInPullRequests(orgName, repoName, branchName, pullRequestNumber, context.github)
    const prettifiedFiles = []
    let configChange = false
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i]
      if (isConfigurationFile(filePath)) {
        configChange = true
      }
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
      if (formatted === fileContent) {
        console.log(`${filePrefix} - ALREADY FORMATTED`)
        continue
      }

      // store the prettified content
      prettifiedFiles.push({ path: filePath, content: formatted })
      console.log(`${filePrefix} - PRETTIFYING`)
    }

    // verify correct config changes
    if (configChange && prettifierConfig.debug) {
      await addComment(
        orgName,
        repoName,
        branchName,
        pullRequestNumber,
        "Prettifier-Bot here. The configuration changes made in this pull request look good to me.",
        context.github
      )
      console.log(`${repoPrefix}: ADDED CONFIG CHANGE DEBUG COMMENT`)
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
      if (e instanceof RequestError) {
        const requestError = e as RequestError
        if (requestError.status === 422 && requestError.message.includes("Required status check")) {
          // pull request of a protected branch
          return
        }
      }
      devError(
        e,
        "creating a commit on a freshly opened pull request",
        { org: orgName, repo: repoName, branch: branchName },
        context.github
      )
    }

    // add community comment
    if (prettifierConfig.commentTemplate !== "") {
      await addComment(
        orgName,
        repoName,
        branchName,
        pullRequestNumber,
        prettifierConfig.commentTemplate,
        context.github
      )
      console.log(`${repoPrefix}: ADDED COMMUNITY COMMENT`)
    }
  } catch (e) {
    if (!(e instanceof LoggedError)) {
      logDevError(
        e,
        "unknown dev error",
        {
          org: orgName,
          repo: repoName,
          branch: branchName,
          event: "on-pull-request",
          payload: util.inspect(context.payload)
        },
        context.github
      )
    }
  }
}
