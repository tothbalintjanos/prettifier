import { DevError, bodyTemplate } from "./dev-error"
import { assert } from "chai"

suite("DevError")

test("constructor()", function () {
  const cause = new Error("cause")
  const context = { foo: "bar" }
  const e = new DevError("activity", cause, context)
  assert.equal(e.activity, "activity")
  assert.equal(e.cause, cause)
  assert.equal(e.context, context)
})

test("bodyTemplate()", function () {
  const actual = bodyTemplate(new Error(), { foo: "bar" })
  assert.isNotEmpty(actual)
})
