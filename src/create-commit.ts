import webhooks from "@octokit/webhooks"
import * as probot from "probot"

export interface FileToCreate {
  path: string
  content: string
}

export async function createCommit(
  org: string,
  repo: string,
  branch: string,
  message: string,
  files: FileToCreate[],
  context: probot.Context<webhooks.WebhookPayloadPush>
) {
  // get the SHA of the latest commit in the branch
  const getRefResult = await context.github.git.getRef({
    owner: org,
    ref: `heads/${branch}`,
    repo
  })
  const currentCommitSha = getRefResult.data.object.sha

  // get the SHA of the tree of the commit
  const getCommitResult = await context.github.git.getCommit({
    commit_sha: currentCommitSha,
    owner: org,
    repo
  })
  const treeSha = getCommitResult.data.tree.sha

  // upload the file contents
  const fileBlobs: probot.Octokit.GitCreateBlobResponse[] = []
  for (const file of files) {
    const response = await context.github.git.createBlob({
      content: file.content,
      encoding: "utf-8",
      owner: org,
      repo
    })
    fileBlobs.push(response.data)
  }

  // create the new tree
  const treeParams: probot.Octokit.GitCreateTreeParamsTree[] = []
  for (let i = 0; i < fileBlobs.length; i++) {
    treeParams.push({
      mode: "100644",
      path: files[i].path,
      sha: fileBlobs[i].sha,
      type: "blob"
    })
  }
  const createTreeResult = await context.github.git.createTree({
    base_tree: treeSha,
    owner: org,
    repo,
    tree: treeParams
  })

  // create the new commit
  const newCommitResult = await context.github.git.createCommit({
    message,
    owner: org,
    parents: [currentCommitSha],
    repo,
    tree: createTreeResult.data.sha
  })
  const newCommitSha = newCommitResult.data.sha

  // update the branch to point to the new commit
  await context.github.git.updateRef({
    owner: org,
    ref: `heads/${branch}`,
    repo,
    sha: newCommitSha
  })
}
