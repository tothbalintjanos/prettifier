import { assert } from "chai"
import { prettifierConfigFromYML } from "./prettifier-configuration-from-yml"
import { PrettifierConfiguration } from "./prettifier-configuration"
import { UserError } from "../logging/user-error"

suite("prettifierConfigFromYML")

test("empty", function () {
  const actual = prettifierConfigFromYML("", "")
  assert.isNotNull(actual)
  assert.instanceOf(actual, PrettifierConfiguration)
  assert.deepEqual(actual.excludeBranches, ["node_modules"])
})

test("excludeBranches in prettifier.yml", function () {
  const actual = prettifierConfigFromYML("excludeBranches: dist", "")
  assert.isNotNull(actual)
  assert.instanceOf(actual, PrettifierConfiguration)
  assert.deepEqual(actual.excludeBranches, ["dist"])
})

test(".prettierignore", async function () {
  const config = prettifierConfigFromYML("", "dist/")
  assert.isFalse(await config.shouldPrettify("dist/foo.md"))
})

test("invalid", function () {
  assert.throws(function () {
    prettifierConfigFromYML("'wrong", "")
  }, UserError)
})
