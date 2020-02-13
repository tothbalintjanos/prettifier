import { GitHubAPI } from "probot/lib/github"
import { LoggedError } from "./logged-error"

/** Logs a user mistake. */
export function userError(err: Error, desc: string, context: any, github: GitHubAPI): never {
  console.log(`${context.org}|${context.repo}: ${desc}:`, err.message)
  // NOTE: to pretend we use this here
  github.toString()
  throw new LoggedError()
}
