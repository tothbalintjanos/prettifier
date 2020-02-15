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
  return `Prettifier-Bot here. I noticed a problem with your configuration:

\`\`\`
${desc}
\`\`\`

More details:
\`\`\`
${err.message}
\`\`\`

I can't format your code until this is fixed.

If you think this is an error on my side, please report this problem using [this form](https://github.com/kevgo/prettifier/issues/new).

I will only comment when I see relevant config changes or non-working configuration. To stop me from making these types of comments on future pull requests, create a file \`.github/prettifier.yml\` (if it doesn't exist) and add the line \`debug: false\`. Please see the [documentation for configuration options](https://kevgo.github.io/prettifier/docs/configuration) for more details.
`
}
