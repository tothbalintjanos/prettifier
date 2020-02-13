import yml from "js-yaml"
import { loadFile } from "../github/load-file"
import { GitHubAPI } from "probot/lib/github"
import { userError } from "../logging/user-error"

/** Loads the .prettierrc file for the code base we are evaluating. */
export async function loadPrettierConfig(
  org: string,
  repo: string,
  branch: string,
  github: GitHubAPI
): Promise<object> {
  let configText = ""
  try {
    configText = await loadFile(org, repo, branch, ".prettierrc", github)
  } catch (e) {
    console.log(`${org}|${repo}|${branch}: NO .prettierrc FOUND`)
    return {}
  }
  try {
    const result = yml.safeLoad(configText)
    console.log(`${org}|${repo}|${branch}: PRETTIER CONFIG: ${JSON.stringify(result)}`)
    return result
  } catch (e) {
    userError(e, "parsing .prettierrc:", { org, repo, branch }, github)
  }
}
