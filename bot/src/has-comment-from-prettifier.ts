import { GitHubAPI } from "probot/lib/github"

/** returns whether the given pull request already has a comment from PrettifierBot */
export async function hasCommentFromPrettifier(
  org: string,
  repo: string,
  pullrequest: number,
  github: GitHubAPI
): Promise<boolean> {
  const result = await github.issues.listComments({
    owner: org,
    repo,
    issue_number: pullrequest
  })
  for (const comment of result.data) {
    if (comment.user.login === "prettifier[bot]") {
      return true
    }
  }
  return false
}
