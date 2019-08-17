import webhooks from "@octokit/webhooks"
import * as probot from "probot"
import * as probotKit from "probot-kit"
import Rollbar from "rollbar"
import { isDifferentText } from "./is-different-text"
import { loadPrettierConfig } from "./load-prettier-config"
import { loadPrettifierConfiguration } from "./load-prettifier-configuration"
import { prettify } from "./prettify"

let rollbar: Rollbar

if (process.env.ROLLBAR_ACCESS_TOKEN) {
  rollbar = new Rollbar({
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
  // ignore deleted branches
  if (
    probotKit.getSha(context) === "0000000000000000000000000000000000000000"
  ) {
    console.log(
      probotKit.getRepoName(context) +
        "|" +
        probotKit.getBranchName(context) +
        ": IGNORING BRANCH DELETION"
    )
    return
  }
  const repoName = probotKit.getRepoName(context)
  const branchName = probotKit.getBranchName(context)
  const commitSha = probotKit.getSha(context).substring(0, 7)

  // log push detected
  const repoPrefix = `${repoName}|${branchName}|${commitSha}`
  console.log(`${repoPrefix}: PUSH DETECTED`)

  // ignore commits by Prettifier
  if (probotKit.getCommitAuthorName(context) === "prettifier[bot]") {
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
  for (const file of await probotKit.currentCommitFiles(context)) {
    const filePath = `${repoPrefix}|${file.filename}`

    // check if the file is prettifiable
    const allowed = await prettifierConfig.shouldPrettify(file.filename)
    if (!allowed) {
      console.log(`${filePath}: NON-PRETTIFYABLE`)
      return
    }

    // load the file content
    const fileData = await probotKit.loadFile(file.filename, context)

    // prettify the file
    const formatted = prettify(fileData.content, file.filename, prettierConfig)

    // ignore if there are no changes
    if (!isDifferentText(formatted, fileData.content)) {
      console.log(`${filePath}: ALREADY FORMATTED`)
      return
    }

    // send the updated file content back to GitHub
    try {
      await probotKit.updateFile(
        file.filename,
        formatted,
        fileData.sha,
        context
      )
      console.log(`${filePath}: PRETTIFYING`)
      rollbar.info("prettifying", {
        branch: branchName,
        commit: commitSha,
        file: filePath,
        repo: repoName
      })
    } catch (e) {
      console.log(`FILE UPLOAD FAILED: ${e.msg}`)
      rollbar.warn("file upload failed", {
        branch: branchName,
        commit: commitSha,
        error: e.msg,
        file: filePath,
        repo: repoName
      })
    }
  }

  console.log(`${repoPrefix}: DONE`)
}
