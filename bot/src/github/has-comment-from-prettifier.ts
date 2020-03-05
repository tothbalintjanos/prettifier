import { GitHubAPI } from "probot/lib/github"
import { devError } from "../logging/dev-error"
import { promises as fs } from "fs"
import path from "path"

/** returns whether the given pull request already has a comment from PrettifierBot */
export async function hasCommentFromPrettifier(
  org: string,
  repo: string,
  branch: string,
  pullrequest: number,
  github: GitHubAPI
): Promise<boolean> {
  const filePath = path.join("src", "github", "pullrequest-comment-authors.graphql")
  let query = ""
  try {
    query = await fs.readFile(filePath, "utf-8")
  } catch (e) {
    devError(e, `reading file '${filePath}'`, { org, repo, branch, pullrequest }, github)
  }
  let callResult
  try {
    callResult = await github.graphql(query, { org, repo, pullrequest })
  } catch (e) {
    devError(e, "get comments of pull request", { org, repo, branch, pullrequest }, github)
  }
  for (const comment of callResult?.repository.pullRequest.comments.nodes) {
    if (comment.author.login === "prettifier") {
      return true
    }
  }
  return false
}
