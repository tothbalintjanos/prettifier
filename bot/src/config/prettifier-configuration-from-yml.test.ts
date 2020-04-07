import { assert } from "chai"
import { prettifierConfigFromYML } from "./prettifier-configuration-from-yml"
import { PrettifierConfiguration } from "./prettifier-configuration"
import { UserError } from "../logging/user-error"

suite("prettifierConfigFromYML")

test("empty", function () {
  const actual = prettifierConfigFromYML("")
  assert.isNotNull(actual)
  assert.instanceOf(actual, PrettifierConfiguration)
  assert.deepEqual(actual.excludeBranches, ["node_modules"])
})

test("valid", function () {
  const actual = prettifierConfigFromYML("excludeBranches: dist")
  assert.isNotNull(actual)
  assert.instanceOf(actual, PrettifierConfiguration)
  assert.deepEqual(actual.excludeBranches, ["dist"])
})

test("invalid", function () {
  assert.throws(function () {
    prettifierConfigFromYML("'wrong")
  }, UserError)
})
