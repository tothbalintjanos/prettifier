import { GitHubAPI } from "probot/lib/github"

/**
 * Returns the pull request number for this branch.
 * If this branch has no pull request, returns 0.
 */
export async function pullRequestForBranch(
  org: string,
  repo: string,
  branch: string,
  github: GitHubAPI
): Promise<number> {
  const result = await github.pulls.list({
    head: `${org}:${branch}`, // request only the pull request for this branch
    owner: org,
    repo,
    state: "open"
  })
  if (result.data.length === 0) {
    return 0
  } else {
    return result.data[0].number
  }
}
