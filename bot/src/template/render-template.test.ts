import { assert } from "chai"
import { renderTemplate } from "./render-template"

suite("formatCommitMessage")

test("without placeholder", function() {
  assert.equal(renderTemplate("hello", {}), "hello")
})

test("commitSha placeholder", function() {
  assert.equal(renderTemplate("hello {{commitSha}}", { commitSha: "SHA" }), "hello SHA")
})

test("files placeholder", function() {
  const template = `{{#files}}
- {{.}}
{{/files}}`
  assert.equal(renderTemplate(template, { files: ["one", "two"] }), "- one\n- two\n")
})
