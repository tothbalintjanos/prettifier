import webhooks from "@octokit/webhooks"
import * as probot from "probot"
import * as probotKit from "probot-kit"
import Rollbar from "rollbar"
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

export function startPrettifier(app: probot.Application) {
  app.on("push", onPush)
  console.log("PRETTIFIER STARTED")
}

// Called when this bot gets notified about a push on Github
async function onPush(context: probot.Context<webhooks.WebhookPayloadPush>) {
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
  const repoName =
    probotKit.getRepoName(context) +
    "|" +
    probotKit.getBranchName(context) +
    "|" +
    probotKit.getSha(context).substring(0, 7)
  console.log(`${repoName}: PUSH DETECTED`)
  if (probotKit.getCommitAuthorName(context) === "prettifier[bot]") {
    console.log(`${repoName}: IGNORING COMMIT BY PRETTIFIER`)
    return
  }
  const branchName = probotKit.getBranchName(context)
  const prettifierConfig = await loadPrettifierConfiguration(context)
  if (prettifierConfig.shouldIgnoreBranch(branchName)) {
    console.log(`${repoName}: IGNORING THIS BRANCH PER BOT CONFIG`)
    return
  }
  const prettierConfig = await loadPrettierConfig(context)
  await probotKit.iterateCurrentCommitFiles(context, async file => {
    const filePath = `${repoName}|${file.filename}`
    const allowed = await prettifierConfig.shouldPrettify(file.filename)
    if (!allowed) {
      console.log(`${filePath}: NON-PRETTIFYABLE`)
      return
    }
    const [fileContent, sha] = await probotKit.loadFile(file.filename, context)
    const formatted = prettify(fileContent, file.filename, prettierConfig)
    if (!isDifferentText(formatted, fileContent)) {
      console.log(`${filePath}: ALREADY FORMATTED`)
      return
    }
    try {
      probotKit.updateFile(file.filename, formatted, sha, context)
      console.log(`${filePath}: PRETTIFYING`)
    } catch (e) {
      console.log(`${filePath}: PRETTIFYING FAILED: ${e.msg}`)
    }
  })
  console.log(`${repoName}: DONE`)
}
