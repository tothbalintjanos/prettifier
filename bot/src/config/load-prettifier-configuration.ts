import { PrettifierConfiguration } from "./prettifier-configuration"
import { GitHubAPI } from "probot/lib/github"
import { loadFile } from "../github/load-file"
import yml from "js-yaml"
import { devError } from "../errors/dev-error"
import { userError } from "../errors/user-error"
import { RequestError } from "@octokit/request-error"

/** Loads the configuration for the current session from the server. */
export async function loadPrettifierConfiguration(
  org: string,
  repo: string,
  branch: string,
  github: GitHubAPI
): Promise<PrettifierConfiguration> {
  let configText = ""
  try {
    configText = await loadFile(org, repo, branch, ".github/prettifier.yml", github)
  } catch (e) {
    if (e.constructor.name === "RequestError") {
      const requestError = e as RequestError
      if (requestError.code === 404) {
        return new PrettifierConfiguration({})
      }
    }
    devError(e, "loading Prettifier configuration", { org, repo, branch }, github)
  }
  let parsed = {}
  try {
    parsed = yml.safeLoad(configText)
  } catch (e) {
    userError(e, `invalid Prettifier configuration: ${configText}`, { org, repo, branch }, github)
  }
  return new PrettifierConfiguration(parsed)
}
