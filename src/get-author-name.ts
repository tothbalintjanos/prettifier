import { Context } from 'probot'

/** Returns the name of the author who made the push described by the given context. */
export function getAuthorName(context: Context): string {
  return context.payload.head_commit.committer.username
}
