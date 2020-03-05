import { GitHubAPI } from "probot/lib/github"
import { PrettifierConfiguration } from "./prettifier-configuration"
import { userError } from "../logging/user-error"
import yml from "js-yaml"

/** Provides a PrettifierConfiguration instance populated with the values in the given YML file */
export function prettifierConfigFromYML(
  configText: string,
  org: string,
  repo: string,
  branch: string,
  pullRequest: number,
  github: GitHubAPI
): PrettifierConfiguration {
  if (configText.trim() === "") {
    return new PrettifierConfiguration({})
  }
  let parsed = {}
  try {
    parsed = yml.safeLoad(configText)
  } catch (e) {
    userError(
      e,
      `Prettifier configuration is not in valid YML format:\n${configText}`,
      { org, repo, branch },
      pullRequest,
      new PrettifierConfiguration({}),
      github
    )
  }
  return new PrettifierConfiguration(parsed)
}
