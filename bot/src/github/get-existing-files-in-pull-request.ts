import { GitHubAPI } from "probot/lib/github"
import { devError } from "../errors/dev-error"
import { Octokit } from "probot"

/**
 * Returns the paths for files that exist in the given pull request.
 * Files that the pull request deletes do not exist anymore.
 */
export async function getExistingFilesInPullRequests(
  org: string,
  repo: string,
  pullRequestNumber: number,
  github: GitHubAPI
): Promise<string[]> {
  let files: Octokit.PullsListFilesResponse = []
  try {
    const callResult = await github.pulls.listFiles({
      owner: org,
      pull_number: pullRequestNumber,
      repo
    })
    files = callResult.data
  } catch (e) {
    devError(e, "getting all files in pull request", { org, repo, pullRequestNumber }, github)
  }
  const result = []
  for (const file of files) {
    if (file.status !== "removed") {
      result.push(file.filename)
    }
  }
  return result
}
