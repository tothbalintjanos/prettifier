import { GitHubAPI } from "probot/lib/github"
import { devError } from "./dev-error"

export async function addComment(org: string, repo: string, issue: number, text: string, github: GitHubAPI) {
  try {
    await github.issues.createComment({
      body: text,
      issue_number: issue,
      owner: org,
      repo
    })
  } catch (e) {
    devError(e, "commenting on a pull request", { org, repo, issue }, github)
  }
}
