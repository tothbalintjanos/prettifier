import { GitHubAPI } from "probot/lib/github"
import { DevError } from "../logging/dev-error"
import { promises as fs } from "fs"
import path from "path"

/** returns whether the given pull request already has a comment from PrettifierBot */
export async function hasCommentFromPrettifier(
  org: string,
  repo: string,
  pullrequest: number,
  github: GitHubAPI
): Promise<boolean> {
  const filePath = path.join("src", "github", "pullrequest-comment-authors.graphql")
  let query = ""
  try {
    query = await fs.readFile(filePath, "utf-8")
  } catch (e) {
    throw new DevError(`reading file '${filePath}'`, e)
  }
  let callResult
  try {
    callResult = await github.graphql(query, { org, repo, pullrequest })
  } catch (e) {
    throw new DevError("get comments of pull request", e)
  }
  for (const comment of callResult?.repository.pullRequest.comments.nodes) {
    if (comment.author.login === "prettifier") {
      return true
    }
  }
  return false
}
