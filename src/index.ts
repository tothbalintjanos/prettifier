import { RequestError } from "@octokit/request-error"
import webhooks from "@octokit/webhooks"
import * as probot from "probot"
import * as probotKit from "probot-kit"
import Rollbar from "rollbar"
import { applyPrettierConfigOverrides } from "./apply-prettier-config-overrides"
import { createCommit } from "./create-commit"
import { createPullRequest } from "./create-pull-request"
import { isDifferentText } from "./is-different-text"
import { loadPrettierConfig } from "./load-prettier-config"
import { loadPrettifierConfiguration } from "./load-prettifier-configuration"
import { prettify } from "./prettify"

if (process.env.ROLLBAR_ACCESS_TOKEN) {
  new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true
  })
}

function startBot(app: probot.Application) {
  app.on("push", onPush)
  console.log("PRETTIFIER STARTED")
}
export = startBot

// Called when this bot gets notified about a push on Github
async function onPush(context: probot.Context<webhooks.WebhookPayloadPush>) {
  const orgName = context.payload.repository.owner.login
  const repoName = context.payload.repository.name
  const branchName = probotKit.getBranchName(context)
  const authorName = context.payload.pusher.name
  const commitSha = probotKit.getSha(context).substring(0, 7)
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
  const prettifierConfig = await loadPrettifierConfiguration(context)

  // check whether this branch should be ignored
  if (prettifierConfig.shouldIgnoreBranch(branchName)) {
    console.log(`${repoPrefix}: IGNORING THIS BRANCH PER BOT CONFIG`)
    return
  }

  // load Prettier configuration
  const prettierConfig = await loadPrettierConfig(context)

  // check all files in the commit
  let changedFiles: string[] = []
  const prettifiedFiles = []
  for (const commit of context.payload.commits) {
    changedFiles = changedFiles.concat(commit.added)
    changedFiles = changedFiles.concat(commit.modified)
  }
  for (const file of changedFiles) {
    const filePath = `${repoPrefix}|${file}`

    // check if the file is prettifiable
    const allowed = await prettifierConfig.shouldPrettify(file)
    if (!allowed) {
      console.log(`${filePath}: NON-PRETTIFYABLE`)
      return
    }

    // load the file content
    const fileData = await probotKit.loadFile(file, context)

    // prettify the file
    const prettierConfigForFile = applyPrettierConfigOverrides(prettierConfig, file)
    const formatted = prettify(fileData.content, file, prettierConfigForFile)

    // ignore if there are no changes
    if (!isDifferentText(formatted, fileData.content)) {
      console.log(`${filePath}: ALREADY FORMATTED`)
      continue
    }

    // store the prettified content
    prettifiedFiles.push({ path: file, content: formatted })
  }

  if (prettifiedFiles.length === 0) {
    // no changed files --> nothing else to do here
    return
  }

  // try creating a commit
  let err: Error
  try {
    await createCommit({
      branch: branchName,
      context,
      files: prettifiedFiles,
      message: `Format ${commitSha}`,
      org: orgName,
      repo: repoName
    })
    console.log(
      `${repoPrefix}: COMMITTED ${prettifiedFiles.length} PRETTIFIED FILES: ${prettifiedFiles
        .map(f => f.path)
        .join(", ")}`
    )
    return
  } catch (e) {
    err = e
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
      context,
      files: prettifiedFiles,
      message: `Format ${commitSha}`,
      org: orgName,
      parentBranch: "master",
      repo: repoName
    })
    console.log(
      `${repoPrefix}: CREATED PULL REQUEST FOR ${prettifiedFiles.length} PRETTIFIED FILES: ${prettifiedFiles
        .map(f => f.path)
        .join(", ")}`
    )
    return
  } catch (e) {
    console.log(`${repoPrefix}: CANNOT CREATE PULL REQUEST:`)
    console.log(e)
  }
}
