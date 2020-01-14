import webhooks from "@octokit/webhooks"
import yml from "js-yaml"
import * as probot from "probot"
import * as probotKit from "probot-kit"

/** Loads the .prettierrc file for the code base we are evaluating. */
export async function loadPrettierConfig(context: probot.Context<webhooks.WebhookPayloadPush>) {
  const repoName = probotKit.getRepoName(context)
  let configFileData: probotKit.LoadFileResult
  try {
    configFileData = await probotKit.loadFile(".prettierrc", context)
  } catch (e) {
    console.log(`${repoName}: NO .prettierrc FOUND`)
    return {}
  }
  try {
    const result = yml.safeLoad(configFileData.content)
    console.log(`${repoName}: PRETTIER CONFIG: ${JSON.stringify(result)}`)
    return result
  } catch (e) {
    console.log(`${repoName}: ERROR PARSING .prettierrc:`, e.message)
  }
}
