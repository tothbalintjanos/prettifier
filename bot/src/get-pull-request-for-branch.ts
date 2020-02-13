import { GitHubAPI } from "probot/lib/github"
import { devError } from "./dev-error"
import { Octokit } from "probot"

/**
 * Returns the pull request number for this branch.
 * If this branch has no pull request, returns 0.
 */
export async function getPullRequestForBranch(
  org: string,
  repo: string,
  branch: string,
  github: GitHubAPI
): Promise<number> {
  let pulls: Octokit.PullsListResponse = []
  try {
    const result = await github.pulls.list({
      head: `${org}:${branch}`, // request only the pull request for this branch
      owner: org,
      repo,
      state: "open"
    })
    pulls = result.data
  } catch (e) {
    devError(e, "loading pull request number for branch", { org, repo, branch }, github)
  }
  if (pulls.length === 0) {
    return 0
  } else {
    return pulls[0].number
  }
}
