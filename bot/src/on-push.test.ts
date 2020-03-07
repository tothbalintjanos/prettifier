import { parsePushContextData } from "./on-push"
import { PushContextData } from "./github/load-push-context-data"
import { assert } from "chai"
import { PrettifierConfiguration } from "./config/prettifier-configuration"

suite("parsePushContextData")

test("empty", function() {
  const data: PushContextData = {
    prettifierConfig: "",
    prettierConfig: "",
    pullRequestNumber: 0
  }
  const actual = parsePushContextData(data)
  assert.deepEqual(actual.prettierConfig, {})
  assert.instanceOf(actual.prettifierConfig, PrettifierConfiguration)
  assert.equal(actual.pullRequestNumber, 0)
})

test("with content", function() {
  const data: PushContextData = {
    prettifierConfig: "excludeFiles: dist",
    prettierConfig: "semi: false",
    pullRequestNumber: 3
  }
  const actual = parsePushContextData(data)
  assert.deepEqual(actual.prettierConfig, { semi: false })
  assert.instanceOf(actual.prettifierConfig, PrettifierConfiguration)
  assert.deepEqual(actual.prettifierConfig.excludeFiles, ["dist"])
  assert.equal(actual.pullRequestNumber, 3)
})
