import { GitHubAPI } from "probot/lib/github"
import { Octokit } from "probot"
import { DevError } from "../logging/dev-error"

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
  // This is a candidate to do via the GraphQL API.
  // This API doesn't support showing whether the file was added or deleted yet.
  // https://github.community/t5/GitHub-API-Development-and/GraphQL-API-doesn-t-indicate-which-files-in-a-PR-are-new/m-p/35031
  let files: Octokit.PullsListFilesResponse = []
  try {
    const callResult = await github.pulls.listFiles({
      owner: org,
      // eslint-disable-next-line @typescript-eslint/camelcase
      pull_number: pullRequestNumber,
      repo
    })
    files = callResult.data
  } catch (e) {
    throw new DevError("getting all files in pull request", e)
  }
  const result = []
  for (const file of files) {
    if (file.status !== "removed") {
      result.push(file.filename)
    }
  }
  return result
}
