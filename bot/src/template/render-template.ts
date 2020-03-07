import mustache from "mustache"

/** Placeholders defines the placeholders in comment templates. */
interface Placeholders {
  /** the SHA of the latest commit pushed */
  commitSha?: string

  /** list of the changed files with formatting problems */
  files?: string[]
}

export function renderTemplate(template: string, data: Placeholders): string {
  return mustache.render(template, data)
}
