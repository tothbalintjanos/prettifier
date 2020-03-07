import { assert } from "chai"
import { prettifierConfigFromYML } from "./prettifier-configuration-from-yml"
import { GitHubAPI } from "probot/lib/github"
import { PrettifierConfiguration } from "./prettifier-configuration"

suite("prettifierConfigFromYML")

test("empty", function() {
  const actual = prettifierConfigFromYML("", "org", "repo", "branch", 0, GitHubAPI())
  assert.isNotNull(actual)
  assert.instanceOf(actual, PrettifierConfiguration)
  assert.deepEqual(actual.excludeBranches, ["node_modules"])
})

test("valid", function() {
  const actual = prettifierConfigFromYML("excludeBranches: dist", "org", "repo", "branch", 0, GitHubAPI())
  assert.isNotNull(actual)
  assert.instanceOf(actual, PrettifierConfiguration)
  assert.deepEqual(actual.excludeBranches, ["dist"])
})
