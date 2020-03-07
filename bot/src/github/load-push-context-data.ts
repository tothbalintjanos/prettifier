import { GitHubAPI } from "probot/lib/github"
import { promises as fs } from "fs"
import { devError } from "../logging/dev-error"
import path from "path"

export interface PushContextData {
  prettifierConfig: string
  prettierConfig: string
  pullRequestNumber: number
}

export async function loadPushContextData(
  org: string,
  repo: string,
  branch: string,
  github: GitHubAPI
): Promise<PushContextData> {
  let query = await fs.readFile(path.join("src", "github", "push-context.graphql"), "utf-8")
  query = query.replace(/\{\{branch\}\}/g, branch)
  let callResult
  try {
    callResult = await github.graphql(query, { org, repo, branch })
  } catch (e) {
    devError(e, `loading push data from GitHub`, { org, repo, branch }, github)
  }

  let pullRequestNumber = 0
  const pulls = callResult?.repository?.ref?.associatedPullRequests
  if (pulls.totalCount > 1) {
    devError(new Error(), "multiple open pull requests found for branch", { org, repo, branch }, github)
  }
  if (pulls.totalCount > 0) {
    pullRequestNumber = pulls.nodes[0].number
  }

  return {
    prettifierConfig: callResult?.repository.prettifierConfig?.text || "",
    prettierConfig: callResult?.repository.prettierConfig?.text || "",
    pullRequestNumber
  }
}
