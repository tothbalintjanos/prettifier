import { Context } from 'probot'

export function getAuthorName(context: Context): string {
  return context.payload.head_commit.committer.username
}
