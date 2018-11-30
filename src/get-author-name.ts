import { Context } from 'probot'

export default function(context: Context): string {
  return context.payload.head_commit.committer.username
}
