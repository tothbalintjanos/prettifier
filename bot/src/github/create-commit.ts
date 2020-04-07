import * as probot from "probot"
import { GitHubAPI } from "probot/lib/github"

export interface FileToCreate {
  path: string
  content: string
}

export async function createCommit(args: {
  org: string
  repo: string
  branch: string
  message: string
  files: FileToCreate[]
  github: GitHubAPI
}): Promise<void> {
  // NOTE: we don't automatically catch errors here
  //       since this can legitimately fail
  //       when trying to create a commit in a protected branch.

  // get the SHA of the latest commit in the branch
  const getRefResult = await args.github.git.getRef({
    owner: args.org,
    ref: `heads/${args.branch}`,
    repo: args.repo,
  })
  const currentCommitSha = getRefResult.data.object.sha

  // get the SHA of the tree of the commit
  const getCommitResult = await args.github.git.getCommit({
    // eslint-disable-next-line @typescript-eslint/camelcase
    commit_sha: currentCommitSha,
    owner: args.org,
    repo: args.repo,
  })
  const treeSha = getCommitResult.data.tree.sha

  // upload the file contents
  const fileBlobs: probot.Octokit.GitCreateBlobResponse[] = []
  for (const file of args.files) {
    const response = await args.github.git.createBlob({
      content: file.content,
      encoding: "utf-8",
      owner: args.org,
      repo: args.repo,
    })
    fileBlobs.push(response.data)
  }

  // create the new tree
  const treeParams: probot.Octokit.GitCreateTreeParamsTree[] = []
  for (let i = 0; i < fileBlobs.length; i++) {
    treeParams.push({
      mode: "100644",
      path: args.files[i].path,
      sha: fileBlobs[i].sha,
      type: "blob",
    })
  }
  const createTreeResult = await args.github.git.createTree({
    // eslint-disable-next-line @typescript-eslint/camelcase
    base_tree: treeSha,
    owner: args.org,
    repo: args.repo,
    tree: treeParams,
  })

  // create the new commit
  const newCommitResult = await args.github.git.createCommit({
    message: args.message,
    owner: args.org,
    parents: [currentCommitSha],
    repo: args.repo,
    tree: createTreeResult.data.sha,
  })
  const newCommitSha = newCommitResult.data.sha

  // update the branch to point to the new commit
  await args.github.git.updateRef({
    owner: args.org,
    ref: `heads/${args.branch}`,
    repo: args.repo,
    sha: newCommitSha,
  })
}
