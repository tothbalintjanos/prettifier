import { PrettifierConfiguration } from "./prettifier-configuration"
import { GitHubAPI } from "probot/lib/github"
import { loadFile } from "./load-file"
import yml from "js-yaml"

/** Loads the configuration for the current session from the server. */
export async function loadPrettifierConfiguration(
  org: string,
  repo: string,
  branchName: string,
  github: GitHubAPI
): Promise<PrettifierConfiguration> {
  const configText = await loadFile(org, repo, branchName, ".github/prettifier.yml", github)
  let parsed = {}
  try {
    parsed = yml.safeLoad(configText)
  } catch (e) {
    console.log(`${org}|${repo}: ERROR PARSING PRETTIFIER CONFIG '${configText}':`, e.message)
  }
  return new PrettifierConfiguration(parsed)
}
