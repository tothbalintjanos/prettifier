import util from "util"
import { GitHubAPI } from "probot/lib/github"
import { LoggedError } from "./logged-error"
import { Context } from "./context"

/**
 * Logs a bug in Prettifier.
 * @param activity the activity that was just done
 * @param err the error encountered
 * @param context additional context (content of local variables when the error happened)
 * @param github GitHubAPI object
 */
export function devError(err: Error, activity: string, context: Context, github: GitHubAPI): never {
  // NOTE: not async since we are already logging an error here, no point in waiting for the result
  logDevError(err, activity, context, github)
  throw new LoggedError()
}

/** logs the given developer error as a GitHub issue */
export async function logDevError(err: Error, activity: string, context: Context, github: GitHubAPI): Promise<void> {
  console.log(`${context.org}|${context.repo}|${context.branch}: Error ${activity}`)
  await github.issues.create({
    owner: "kevgo",
    repo: "prettifier",
    title: `Error ${activity}: ${err.message}`,
    body: body(err, context),
    labels: ["GitHubOps"]
  })
}

export function body(err: Error, context: object): string {
  let result = "Environment:\n"
  for (const [k, v] of Object.entries(context)) {
    result += `- ${k}: ${v}\n`
  }
  result += `

### Error

\`\`\`
${util.inspect(err)}
\`\`\`

### Stack

\`\`\`
${err.stack}
\`\`\`
`
  return result
}
