import { RequestError } from "@octokit/request-error"
import webhooks from "@octokit/webhooks"
import * as probot from "probot"
import { applyPrettierConfigOverrides } from "./prettier/apply-prettier-config-overrides"
import { concatToSet } from "./set/concat-to-set"
import { createCommit } from "./github/create-commit"
import { createPullRequest } from "./github/create-pull-request"
import { formatCommitMessage } from "./template/format-commit-message"
import { loadPrettierConfig } from "./prettier/load-prettier-config"
import { loadPrettifierConfiguration } from "./config/load-prettifier-configuration"
import { prettify } from "./prettier/prettify"
import { getPullRequestForBranch } from "./github/get-pull-request-for-branch"
import { addComment } from "./github/create-comment"
import { hasCommentFromPrettifier } from "./github/has-comment-from-prettifier"
import { LoggedError } from "./errors/logged-error"
import { loadFile } from "./github/load-file"
import { devError, logDevError } from "./errors/dev-error"
import util from "util"
import { removeAllFromSet } from "./set/remove-all-from-set"

/** called when this bot gets notified about a push on Github */
export async function onPush(context: probot.Context<webhooks.WebhookPayloadPush>) {
  try {
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
      if (pullRequestNumber === 0) {
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
      removeAllFromSet(changedFiles, commit.removed)
    }

    // prettify all changed files
    const prettifiedFiles = []
    let i = 0
    for (const file of changedFiles) {
      i++
      const filePrefix = `${repoPrefix}: FILE ${i}/${changedFiles.size} (${file})`

      // ignore non-prettifiable files
      let allowed = false
      try {
        allowed = await prettifierConfig.shouldPrettify(file)
      } catch (e) {
        if (e instanceof LoggedError) {
          continue
        }
        throw e
      }
      if (!allowed) {
        console.log(`${filePrefix} - NON-PRETTIFYABLE`)
        continue
      }

      // load the file content
      const fileContent = await loadFile(orgName, repoName, branchName, file, context.github)

      // prettify the file
      const prettierConfigForFile = applyPrettierConfigOverrides(prettierConfig, file)
      const formatted = prettify(fileContent, file, prettierConfigForFile)

      // ignore if there are no changes
      if (formatted !== fileContent) {
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
    let createCommitError: Error | null = null
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
      // this error gets logged below where it is handled
      createCommitError = e
    }

    if (!createCommitError && prettifierConfig.commentTemplate !== "") {
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

    if (!createCommitError) {
      return
    }

    // When reaching this, the pull request has failed.
    // Analyze the error to see if we should try creating a pull request.
    let tryPullRequest = false
    if (createCommitError.constructor.name === "RequestError") {
      const requestError = createCommitError as RequestError
      if (requestError.status === 422 && requestError.message.includes("Required status check")) {
        tryPullRequest = true
      }
    }
    if (!tryPullRequest) {
      devError(createCommitError, "committing changes", { orgName, repoName, branchName }, context.github)
    }

    // try creating a pull request
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
    if (!(e instanceof LoggedError)) {
      logDevError(e, "unknown dev error", { event: "on-push", payload: util.inspect(context.payload) }, context.github)
    }
  }
}
