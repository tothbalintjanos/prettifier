import { GitHubAPI } from "probot/lib/github"
import { promises as fs } from "fs"
import { devError } from "../logging/dev-error"
import path from "path"

export interface PullRequestContextData {
  prettifierConfig: string
  prettierConfig: string
}

export async function loadPullRequestContextData(
  org: string,
  repo: string,
  branch: string,
  github: GitHubAPI
): Promise<PullRequestContextData> {
  let query = await fs.readFile(path.join("src", "github", "pull-request-context.graphql"), "utf-8")
  query = query.replace(/\{\{branch\}\}/g, branch)
  let callResult
  try {
    callResult = await github.graphql(query, { org, repo, branch })
  } catch (e) {
    devError(e, `loading pull request data from GitHub`, { org, repo, branch }, github)
  }
  return {
    prettifierConfig: callResult?.repository.prettifierConfig?.text || "",
    prettierConfig: callResult?.repository.prettierConfig?.text || ""
  }
}
