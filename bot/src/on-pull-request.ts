import * as probot from "probot"
import webhooks from "@octokit/webhooks"
import { loadFile } from "./github/load-file"
import { getExistingFilesInPullRequests } from "./github/get-existing-files-in-pull-request"
import { formatCommitMessage } from "./template/format-commit-message"
import { createCommit } from "./github/create-commit"
import { applyPrettierConfigOverrides } from "./prettier/apply-prettier-config-overrides"
import { prettify } from "./prettier/prettify"
import { addComment } from "./github/create-comment"
import { devError, logDevError } from "./logging/dev-error"
import { LoggedError } from "./logging/logged-error"
import util from "util"
import { RequestError } from "@octokit/request-error"
import { isConfigurationFile } from "./config/is-configuration-file"
import { GitHubAPI } from "probot/lib/github"
import { promises as fs } from "fs"
import path from "path"
import { prettierConfigFromYML } from "./prettier/prettier-config-from-yml"
import { prettifierConfigFromYML } from "./config/prettifier-configuration-from-yml"

/** called when this bot gets notified about a new pull request */
export async function onPullRequest(context: probot.Context<webhooks.WebhookPayloadPullRequest>): Promise<void> {
  let org = ""
  let repo = ""
  let branch = ""
  let pullRequestNumber = 0
  try {
    org = context.payload.repository.owner.login
    repo = context.payload.repository.name
    branch = context.payload.pull_request.head.ref
    pullRequestNumber = context.payload.pull_request.number
    const repoPrefix = `${org}/${repo}|#${pullRequestNumber}`
    console.log(`${repoPrefix}: PULL REQUEST DETECTED`)
    if (context.payload.action !== "opened") {
      console.log(`${repoPrefix}: PULL REQUEST ACTION IS ${context.payload.action}, IGNORING`)
      return
    }

    // load additional information from GitHub
    const pullData = await loadPullRequestData(org, repo, branch, context.github)
    const prettifierConfig = prettifierConfigFromYML(
      pullData.prettifierConfigText,
      org,
      repo,
      branch,
      pullRequestNumber,
      context.github
    )
    console.log(`${repoPrefix}: BOT CONFIG: ${JSON.stringify(prettifierConfig)}`)

    const prettierConfig = prettierConfigFromYML(
      pullData.prettierConfigText,
      org,
      repo,
      branch,
      pullRequestNumber,
      prettifierConfig,
      context.github
    )
    console.log(`${repoPrefix}: PRETTIER CONFIG: ${JSON.stringify(prettierConfig)}`)

    // check whether this branch should be ignored
    if (prettifierConfig.shouldIgnoreBranch(branch)) {
      console.log(`${repoPrefix}: IGNORING THIS BRANCH PER BOT CONFIG`)
      return
    }

    // load the files that this PR changes
    const files = await getExistingFilesInPullRequests(org, repo, branch, pullRequestNumber, context.github)
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
      const fileContent = await loadFile(org, repo, branch, filePath, context.github)

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
        org,
        repo,
        branch,
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
    for (let createCommitTries = 2; createCommitTries > 0; createCommitTries--) {
      try {
        await createCommit({
          branch,
          github: context.github,
          files: prettifiedFiles,
          message: formatCommitMessage(prettifierConfig.commitMessage, `#${pullRequestNumber}`),
          org,
          repo
        })
        console.log(`${repoPrefix}: COMMITTED ${prettifiedFiles.length} PRETTIFIED FILES`)
      } catch (e) {
        if (e instanceof RequestError) {
          const requestError = e as RequestError
          if (requestError.status === 422) {
            if (requestError.message.includes("Required status check")) {
              // pull request of a protected branch
              return
            }
            if (requestError.message === "Update is not a fast forward") {
              // somebody else committed at the same time --> try again
              console.log(
                `${repoPrefix}: CANNOT CREATE COMMIT ON NEW PULL REQUEST BECAUSE UPDATE IS NOT A FAST FORWARD, TRYING AGAIN`
              )
              continue
            }
          }
          if (requestError.status === 403) {
            if (requestError.message.includes("Resource not accessible by integration")) {
              // nothing we can do here
              // TODO: send error to user asking to update permissions?
              return
            }
          }
        }
        devError(e, "creating a commit on a freshly opened pull request", { org, repo, branch }, context.github)
      }
    }

    // add community comment
    if (prettifierConfig.commentTemplate !== "") {
      await addComment(org, repo, branch, pullRequestNumber, prettifierConfig.commentTemplate, context.github)
      console.log(`${repoPrefix}: ADDED COMMUNITY COMMENT`)
    }
  } catch (e) {
    if (!(e instanceof LoggedError)) {
      logDevError(
        e,
        "unknown dev error",
        {
          org,
          repo,
          branch,
          event: "on-pull-request",
          payload: util.inspect(context.payload)
        },
        context.github
      )
    }
  }
}

interface PullRequestData {
  prettifierConfigText: string
  prettierConfigText: string
}

async function loadPullRequestData(
  org: string,
  repo: string,
  branch: string,
  github: GitHubAPI
): Promise<PullRequestData> {
  const query = await fs.readFile(path.join("src", "on-pull-request.graphql"), "utf-8")
  let callResult
  try {
    callResult = await github.graphql(query, { org, repo })
  } catch (e) {
    devError(e, `loading pull-request data from GitHub`, { org, repo, branch }, github)
  }

  return {
    prettifierConfigText: callResult?.repository.prettifierConfig?.text || "",
    prettierConfigText: callResult?.repository.prettierConfig?.text || ""
  }
}
