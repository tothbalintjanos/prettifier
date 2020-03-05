import { GitHubAPI } from "probot/lib/github"
import { devError } from "../logging/dev-error"
import path from "path"
import { promises as fs } from "fs"

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
  const filePath = path.join("src", "github", "pullrequests-for-branch.graphql")
  let query = ""
  try {
    query = await fs.readFile(filePath, "utf-8")
  } catch (e) {
    devError(e, `reading file '${filePath}'`, { org, repo, branch }, github)
  }
  let callResult
  try {
    callResult = await github.graphql(query, { org, repo, branch })
  } catch (e) {
    devError(e, "loading pull request number for branch", { org, repo, branch }, github)
  }
  const pulls = callResult?.repository?.ref?.associatedPullRequests
  if (pulls.totalCount === 0) {
    return 0
  }
  if (pulls.totalCount > 1) {
    devError(new Error(), "multiple open pull requests found for branch", { org, repo, branch }, github)
  }
  return pulls.nodes[0].number
}
