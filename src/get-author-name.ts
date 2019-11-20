import webhooks from "@octokit/webhooks"
import * as probot from "probot"

/** Returns the name of the author who made the push described by the given context. */
export function getAuthorName(context: probot.Context<webhooks.WebhookPayloadPush>): string {
  const commit = context.payload.head_commit as any
  return commit.committer.username
}
