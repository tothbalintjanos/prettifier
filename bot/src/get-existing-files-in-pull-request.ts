import { GitHubAPI } from "probot/lib/github"

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
  const files = await github.pulls.listFiles({
    owner: org,
    pull_number: pullRequestNumber,
    repo
  })
  const result = []
  for (const file of files.data) {
    if (file.status !== "removed") {
      result.push(file.filename)
    }
  }
  return result
}
