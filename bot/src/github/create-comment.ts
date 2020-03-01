import { GitHubAPI } from "probot/lib/github"
import { devError } from "../logging/dev-error"

export async function addComment(
  org: string,
  repo: string,
  branch: string,
  issue: number,
  text: string,
  github: GitHubAPI
): Promise<void> {
  try {
    await github.issues.createComment({
      body: text,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: issue,
      owner: org,
      repo
    })
  } catch (e) {
    devError(e, "commenting on a pull request", { org, repo, branch, issue }, github)
  }
}
