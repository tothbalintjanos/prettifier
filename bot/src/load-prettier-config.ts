import yml from "js-yaml"
import { loadFile } from "./load-file"
import { GitHubAPI } from "probot/lib/github"

/** Loads the .prettierrc file for the code base we are evaluating. */
export async function loadPrettierConfig(org: string, repo: string, branch: string, github: GitHubAPI) {
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
    console.log(`${org}|${repo}|${branch}: ERROR PARSING .prettierrc:`, e.message)
  }
}
