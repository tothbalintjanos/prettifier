import { assert } from "chai"
import { formatCommitMessage } from "../src/format-commit-message"

suite("formatCommitMessage")

test("without placeholder", function() {
  assert.equal(formatCommitMessage("hello", "SHA"), "hello")
})

test("with placeholder", function() {
  assert.equal(formatCommitMessage("hello {{commitSha}}", "SHA"), "hello SHA")
})
