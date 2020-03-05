import { promises as fs } from "fs"
import path from "path"
import { devError } from "../logging/dev-error"
import { GitHubAPI } from "probot/lib/github"
import { PrettifierConfiguration } from "../config/prettifier-configuration"
import { PrettierConfiguration } from "../prettier/prettier-config"
import { prettifierConfigFromYML } from "../config/prettifier-configuration-from-yml"
import { prettierConfigFromYML } from "../prettier/prettier-config-from-yml"

interface LoadConfigurationResult {
  prettierConfig: PrettierConfiguration
  prettifierConfig: PrettifierConfiguration
}

export async function loadConfigurations(
  org: string,
  repo: string,
  branch: string,
  pullRequest: number,
  github: GitHubAPI
): Promise<LoadConfigurationResult> {
  // load the GraphQL query
  const filePath = path.join("src", "github", "load-configurations.graphql")
  let query = ""
  try {
    query = await fs.readFile(filePath, "utf-8")
  } catch (e) {
    devError(e, `reading local file '${filePath}'`, { org, repo, branch }, github)
  }

  // make the GraphQL call
  query = query.replace(/\{\{branch\}\}/g, branch)
  let callResult
  try {
    callResult = await github.graphql(query, { org, repo, branch })
  } catch (e) {
    devError(e, "loading configuration files", { org, repo, branch }, github)
  }

  const prettifierConfig = prettifierConfigFromYML(
    callResult?.repository.prettifierConfig?.text || "",
    org,
    repo,
    branch,
    pullRequest,
    github
  )
  const prettierConfig = prettierConfigFromYML(
    callResult?.repository.prettierConfig?.text || "",
    org,
    repo,
    branch,
    pullRequest,
    prettifierConfig,
    github
  )

  try {
    return { prettierConfig, prettifierConfig }
  } catch (e) {
    devError(e, "reading configuration files result", { org, repo, branch, callResult }, github)
  }
}
