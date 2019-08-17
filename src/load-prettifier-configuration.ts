import webhooks from "@octokit/webhooks"
import * as probot from "probot"
import * as probotKit from "probot-kit"
import { PrettifierConfiguration } from "./prettifier-configuration"

/** Loads the configuration for the current session from the server. */
export async function loadPrettifierConfiguration(
  context: probot.Context<webhooks.WebhookPayloadPush>
): Promise<PrettifierConfiguration> {
  const actualConfig = await probotKit.loadBotConfig(
    ".github/prettifier.yml",
    context
  )
  return new PrettifierConfiguration(actualConfig)
}
