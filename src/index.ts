import webhooks from "@octokit/webhooks"
import * as probot from "probot"
import * as probotKit from "probot-kit"
import Rollbar from "rollbar"
import { applyPrettierConfigOverrides } from "./apply-prettier-config-overrides"
import { createCommit } from "./create-commit"
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

    // send the updated file content back to GitHub
    prettifiedFiles.push({ path: file, content: formatted })
  }

  if (prettifiedFiles.length > 0) {
    try {
      await createCommit(orgName, repoName, branchName, `Format ${commitSha}`, prettifiedFiles, context)
    } catch (e) {
      console.log(`${repoPrefix}: CANNOT COMMIT CHANGES!`)
      console.log(e)
    }
  }

  console.log(
    `${repoPrefix}: PRETTIFIED ${prettifiedFiles.length} FILES: ${prettifiedFiles.map(f => f.path).join(", ")}`
  )
}
