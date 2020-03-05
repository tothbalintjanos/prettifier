import { RequestError } from "@octokit/request-error"
import webhooks from "@octokit/webhooks"
import * as probot from "probot"
import { applyPrettierConfigOverrides } from "./prettier/apply-prettier-config-overrides"
import { createCommit } from "./github/create-commit"
import { createPullRequest } from "./github/create-pull-request"
import { formatCommitMessage } from "./template/format-commit-message"
import { prettify } from "./prettier/prettify"
import { getPullRequestForBranch } from "./github/get-pull-request-for-branch"
import { addComment } from "./github/create-comment"
import { hasCommentFromPrettifier } from "./github/has-comment-from-prettifier"
import { LoggedError } from "./logging/logged-error"
import { loadFile } from "./github/load-file"
import { devError, logDevError } from "./logging/dev-error"
import util from "util"
import { concatToSet, removeAllFromSet } from "./helpers/set-tools"
import { loadConfigurations } from "./github/load-configurations"

/** called when this bot gets notified about a push on Github */
export async function onPush(context: probot.Context<webhooks.WebhookPayloadPush>): Promise<void> {
  let org = ""
  let repo = ""
  let branch = ""
  let author = ""
  let commitSha = ""
  try {
    org = context.payload.repository.owner.login
    repo = context.payload.repository.name
    branch = context.payload.ref.replace("refs/heads/", "")
    author = context.payload.pusher.name
    commitSha = context.payload.after.substring(0, 7)
    const repoPrefix = `${org}/${repo}|${branch}|${commitSha}`

    // ignore deleted branches
    if (commitSha === "0000000") {
      console.log(`${repoPrefix}: IGNORING BRANCH DELETION`)
      return
    }

    // log push detected
    console.log(`${repoPrefix}: PUSH DETECTED`)

    // ignore commits by Prettifier
    if (author === "prettifier[bot]") {
      console.log(`${repoPrefix}: IGNORING COMMIT BY PRETTIFIER`)
      return
    }

    // load configurations
    const { prettifierConfig, prettierConfig } = await loadConfigurations(org, repo, branch, 0, context.github)
    console.log(`${repoPrefix}: BOT CONFIG: ${JSON.stringify(prettifierConfig)}`)
    console.log(`${repoPrefix}: PRETTIER CONFIG: ${JSON.stringify(prettierConfig)}`)

    // check whether this branch should be ignored
    if (prettifierConfig.shouldIgnoreBranch(branch)) {
      console.log(`${repoPrefix}: IGNORING THIS BRANCH PER BOT CONFIG`)
      return
    }

    // check pull requests
    let pullRequestNumber = -1
    if (prettifierConfig.pullsOnly) {
      pullRequestNumber = await getPullRequestForBranch(org, repo, branch, context.github)
      if (pullRequestNumber === 0) {
        console.log(`${repoPrefix}: IGNORING THIS BRANCH BECAUSE IT HAS NO OPEN PULL REQUEST`)
        return
      }
      console.log(`${repoPrefix}: THIS BRANCH HAS PULL REQUEST #${pullRequestNumber}`)
    }

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
      let fileContent = ""
      try {
        fileContent = await loadFile(org, repo, branch, file, context.github)
      } catch (e) {
        if (e instanceof RequestError) {
          const requestError = e as RequestError
          if (requestError.status === 403) {
            // file exists but the server refused to serve the file --> ignore
            continue
          }
          if (requestError.status === 404) {
            // file no longer exists, probably because the branch was deleted --> ignore
            continue
          }
        }
        throw e
      }

      // prettify the file
      const prettierConfigForFile = applyPrettierConfigOverrides(prettierConfig, file)
      const formatted = prettify(fileContent, file, prettierConfigForFile)

      // ignore if there are no changes
      if (formatted === fileContent) {
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
        branch,
        github: context.github,
        files: prettifiedFiles,
        message: formatCommitMessage(prettifierConfig.commitMessage, commitSha),
        org,
        repo
      })
      console.log(`${repoPrefix}: COMMITTED ${prettifiedFiles.length} PRETTIFIED FILES`)
    } catch (e) {
      // this error gets logged below where it is handled
      createCommitError = e
    }

    if (!createCommitError && prettifierConfig.commentTemplate !== "") {
      if (pullRequestNumber === -1) {
        pullRequestNumber = await getPullRequestForBranch(org, repo, branch, context.github)
      }
      if (pullRequestNumber > 0) {
        const hasComment = await hasCommentFromPrettifier(org, repo, branch, pullRequestNumber, context.github)
        if (!hasComment) {
          addComment(
            org,
            repo,
            branch,
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
    if (createCommitError instanceof RequestError) {
      const requestError = createCommitError as RequestError
      if (requestError.status === 422 || requestError.status === 403) {
        tryPullRequest = true
      }
    }
    if (!tryPullRequest) {
      devError(createCommitError, "committing changes", { org, repo, branch }, context.github)
    }

    // try creating a pull request
    await createPullRequest({
      body: "Formats recently committed files. No content changes.",
      branch: `prettifier-${commitSha}`,
      github: context.github,
      files: prettifiedFiles,
      message: formatCommitMessage(prettifierConfig.commitMessage, commitSha),
      org,
      parentBranch: "master",
      repo
    })
    console.log(`${repoPrefix}: CREATED PULL REQUEST FOR ${prettifiedFiles.length} PRETTIFIED FILES`)
  } catch (e) {
    if (!(e instanceof LoggedError)) {
      logDevError(
        e,
        "unknown dev error",
        { org, repo, branch, event: "on-push", payload: util.inspect(context.payload) },
        context.github
      )
    }
  }
}
