import { PullRequestContextData } from "./github/load-pull-request-context-data"
import { assert } from "chai"
import { PrettifierConfiguration } from "./config/prettifier-configuration"
import { parsePullRequestContextData } from "./on-pull-request"
import { GitHubAPI } from "probot/lib/github"

suite("parsePullRequestContextData")

test("empty", function() {
  const data: PullRequestContextData = {
    prettifierConfig: "",
    prettierConfig: ""
  }
  const actual = parsePullRequestContextData("org", "repo", "branch", 3, data, GitHubAPI())
  assert.deepEqual(actual.prettierConfig, {})
  assert.instanceOf(actual.prettifierConfig, PrettifierConfiguration)
})

test("with content", function() {
  const data: PullRequestContextData = {
    prettifierConfig: "excludeFiles: dist",
    prettierConfig: "semi: false"
  }
  const actual = parsePullRequestContextData("org", "repo", "branch", 3, data, GitHubAPI())
  assert.deepEqual(actual.prettierConfig, { semi: false })
  assert.deepEqual(actual.prettifierConfig.excludeFiles, ["dist"])
})
