import { GitHubAPI } from "probot/lib/github"
import { LoggedError } from "./logged-error"
import { addComment } from "../github/create-comment"
import { Context } from "./context"
import { PrettifierConfiguration } from "../config/prettifier-configuration"

/** Logs a user mistake. */
export function userError(
  err: Error,
  desc: string,
  context: Context,
  pullRequest: number,
  config: PrettifierConfiguration,
  github: GitHubAPI
): never {
  console.log(`${context.org}|${context.repo}: USER ERROR: ${desc}:`, err.message)
  if (pullRequest > 0 && config.debug) {
    addComment(context.org, context.repo, context.branch, pullRequest, body(err, desc), github)
  }
  throw new LoggedError()
}

function body(err: Error, desc: string): string {
  return `Prettifier here. I noticed a problem with your configuration:

Error ${desc}: ${err.message}

I can't format your code until this is fixed.
If you think this is an error on my side, please report this problem at https://github.com/kevgo/prettifier/issues/new.

To stop me from making these types of comments on future pull requests, please create a file \`.github/prettifier.yml\` (if it doesn't exist) and add the line \`debug: false\`.
For more details, please visit https://kevgo.github.io/prettifier/docs/configuration.

Your friendly Prettifier-Bot
`
}
