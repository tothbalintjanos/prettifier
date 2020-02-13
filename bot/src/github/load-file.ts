import { GitHubAPI } from "probot/lib/github"
import { devError } from "../logging/dev-error"

/** Loads the content of the given file in the given branch from GitHub. */
export async function loadFile(
  org: string,
  repo: string,
  branchName: string,
  filePath: string,
  github: GitHubAPI
): Promise<string> {
  const result = await github.repos.getContents({
    owner: org,
    path: filePath,
    ref: branchName,
    repo
  })
  if (result.data instanceof Array) {
    devError(
      new Error(),
      "loading the content of a file from GitHub",
      {
        org,
        repo,
        branchName,
        filePath,
        message: "Received unexpected array while loading a single file from GitHub, expected single entry"
      },
      github
    )
  }
  return Buffer.from(result.data.content || "", "base64").toString()
}
