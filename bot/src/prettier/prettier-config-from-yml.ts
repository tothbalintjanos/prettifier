import yml from "js-yaml"
import { GitHubAPI } from "probot/lib/github"
import { userError } from "../logging/user-error"
import { PrettifierConfiguration } from "../config/prettifier-configuration"
import { PrettierConfiguration } from "./prettier-configuration"

/** Returns a PrettierConfiguration with the given content */
export function prettierConfigFromYML(
  configText: string,
  org: string,
  repo: string,
  branch: string,
  pullRequest: number,
  prettifierConfig: PrettifierConfiguration,
  github: GitHubAPI
): PrettierConfiguration {
  try {
    return yml.safeLoad(configText) || {}
  } catch (e) {
    userError(e, "parsing .prettierrc:", { org, repo, branch }, pullRequest, prettifierConfig, github)
  }
}
