import { UserError, bodyTemplate } from "./user-error"
import { assert } from "chai"

suite("UserError")

test("constructor()", function () {
  const cause = new Error()
  const context = { foo: "bar" }
  const actual = new UserError("activity", cause, context)
  assert.equal(actual.activity, "activity")
  assert.equal(actual.cause, cause)
  assert.equal(actual.context, context)
})

test("bodyTemplate()", function () {
  const actual = bodyTemplate(new Error(), "desc")
  assert.isNotEmpty(actual)
})
