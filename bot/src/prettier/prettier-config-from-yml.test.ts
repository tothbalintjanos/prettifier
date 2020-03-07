import { prettierConfigFromYML } from "./prettier-config-from-yml"
import { PrettifierConfiguration } from "../config/prettifier-configuration"
import { GitHubAPI } from "probot/lib/github"
import { assert } from "chai"

suite("prettierConfigFromYML")

test("empty", function() {
  const prettifierConfig = new PrettifierConfiguration({})
  const actual = prettierConfigFromYML("", "org", "repo", "branch", 0, prettifierConfig, GitHubAPI())
  assert.deepEqual(actual, {})
})

test("with content", function() {
  const prettifierConfig = new PrettifierConfiguration({})
  const actual = prettierConfigFromYML("semi: false", "org", "repo", "branch", 0, prettifierConfig, GitHubAPI())
  assert.deepEqual(actual, { semi: false })
})
