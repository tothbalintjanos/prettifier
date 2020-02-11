import { GitHubAPI } from "probot/lib/github"

export async function addComment(org: string, repo: string, issue: number, text: string, github: GitHubAPI) {
  await github.issues.createComment({
    body: text,
    issue_number: issue,
    owner: org,
    repo
  })
}
