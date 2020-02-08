export function formatCommitMessage(template: string, commitSha: string): string {
  return template.replace(/\{\{commitSha\}\}/g, commitSha)
}
