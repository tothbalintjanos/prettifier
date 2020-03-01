import { GitHubAPI } from "probot/lib/github"
import { devError } from "../logging/dev-error"
import { Octokit } from "probot"

/** returns whether the given pull request already has a comment from PrettifierBot */
export async function hasCommentFromPrettifier(
  org: string,
  repo: string,
  branch: string,
  pullrequest: number,
  github: GitHubAPI
): Promise<boolean> {
  let comments: Octokit.IssuesListCommentsResponse = []
  try {
    const result = await github.issues.listComments({
      owner: org,
      repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: pullrequest
    })
    comments = result.data
  } catch (e) {
    devError(e, "get comments of pull request", { org, repo, branch, pullrequest }, github)
  }
  for (const comment of comments) {
    if (comment.user.login === "prettifier[bot]") {
      return true
    }
  }
  return false
}
