import webhooks from "@octokit/webhooks"
import * as probot from "probot"

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
  context: probot.Context<webhooks.WebhookPayloadPush>
}) {
  // get the SHA of the latest commit in the branch
  const getRefResult = await args.context.github.git.getRef({
    owner: args.org,
    ref: `heads/${args.branch}`,
    repo: args.repo
  })
  const currentCommitSha = getRefResult.data.object.sha

  // get the SHA of the tree of the commit
  const getCommitResult = await args.context.github.git.getCommit({
    commit_sha: currentCommitSha,
    owner: args.org,
    repo: args.repo
  })
  const treeSha = getCommitResult.data.tree.sha

  // upload the file contents
  const fileBlobs: probot.Octokit.GitCreateBlobResponse[] = []
  for (const file of args.files) {
    const response = await args.context.github.git.createBlob({
      content: file.content,
      encoding: "utf-8",
      owner: args.org,
      repo: args.repo
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
      type: "blob"
    })
  }
  const createTreeResult = await args.context.github.git.createTree({
    base_tree: treeSha,
    owner: args.org,
    repo: args.repo,
    tree: treeParams
  })

  // create the new commit
  const newCommitResult = await args.context.github.git.createCommit({
    message: args.message,
    owner: args.org,
    parents: [currentCommitSha],
    repo: args.repo,
    tree: createTreeResult.data.sha
  })
  const newCommitSha = newCommitResult.data.sha

  // update the branch to point to the new commit
  await args.context.github.git.updateRef({
    owner: args.org,
    ref: `heads/${args.branch}`,
    repo: args.repo,
    sha: newCommitSha
  })
}
