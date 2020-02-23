import { assert } from "chai"
import { PrettifierConfiguration } from "./prettifier-configuration"

suite("PrettifierConfiguration.shouldIgnoreBranch")

test("name listed in config", function() {
  const config = new PrettifierConfiguration({
    excludeBranches: ["master"]
  })
  assert.isTrue(config.shouldIgnoreBranch("master"))
})

test("name not listed in config", function() {
  const config = new PrettifierConfiguration({
    excludeBranches: ["master"]
  })
  assert.isFalse(config.shouldIgnoreBranch("foo"))
})

test("no botConfig", function() {
  const config = new PrettifierConfiguration({})
  assert.isFalse(config.shouldIgnoreBranch("foo"))
})

suite("PrettifierConfiguration.shouldPrettify")

test("ignores node_modules out of the box", async function() {
  const config = new PrettifierConfiguration({})
  const result = await config.shouldPrettify("node_modules/foo/bar.js")
  assert.isFalse(result)
})

test("prettifierConfig excludeFiles contains the folder name", async function() {
  const config = new PrettifierConfiguration({ excludeFiles: ["dist"] })
  const result = await config.shouldPrettify("dist/foo.js")
  assert.isFalse(result)
})

test("allows other files", async function() {
  const config = new PrettifierConfiguration({})
  const result = await config.shouldPrettify("foo.js")
  assert.isTrue(result)
})
