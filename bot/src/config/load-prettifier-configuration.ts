import { PrettifierConfiguration } from "./prettifier-configuration"
import { GitHubAPI } from "probot/lib/github"
import { loadFile } from "../github/load-file"
import yml from "js-yaml"
import { devError } from "../logging/dev-error"
import { userError } from "../logging/user-error"
import { RequestError } from "@octokit/request-error"

/** Loads the configuration for the current session from the server. */
export async function loadPrettifierConfiguration(
  org: string,
  repo: string,
  branch: string,
  pullRequest: number,
  github: GitHubAPI
): Promise<PrettifierConfiguration> {
  let configText = ""
  try {
    configText = await loadFile(org, repo, branch, ".github/prettifier.yml", github)
  } catch (e) {
    if (e instanceof RequestError) {
      if ((e as RequestError).code === 404) {
        return new PrettifierConfiguration({})
      }
    }
    devError(e, "loading Prettifier configuration", { org, repo, branch }, github)
  }
  let parsed = {}
  try {
    parsed = yml.safeLoad(configText)
  } catch (e) {
    userError(
      e,
      `invalid Prettifier configuration:\n${configText}`,
      { org, repo, branch },
      pullRequest,
      new PrettifierConfiguration({}),
      github
    )
  }
  return new PrettifierConfiguration(parsed)
}
