import { createCommit, FileToCreate } from "./create-commit"
import { GitHubAPI } from "probot/lib/github"
import { devError } from "../errors/dev-error"

export async function createPullRequest(args: {
  org: string
  repo: string
  parentBranch: string
  branch: string
  message: string
  body: string
  files: FileToCreate[]
  github: GitHubAPI
}) {
  // get the SHA of the latest commit in the parent branch
  try {
    const getRefResult = await args.github.git.getRef({
      owner: args.org,
      ref: `heads/${args.parentBranch}`,
      repo: args.repo
    })
    const parentBranchSHA = getRefResult.data.object.sha

    // create a branch for the changes
    await args.github.git.createRef({
      owner: args.org,
      ref: `refs/heads/${args.branch}`,
      repo: args.repo,
      sha: parentBranchSHA
    })

    // commit changes into in the new branch
    await createCommit(args)

    // create the pull request
    await args.github.pulls.create({
      base: args.parentBranch,
      body: args.body,
      head: args.branch,
      owner: args.org,
      repo: args.repo,
      title: args.message
    })
  } catch (e) {
    devError(e, "creating a pull request", args, args.github)
  }
}
