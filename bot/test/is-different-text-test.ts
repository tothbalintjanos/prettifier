import { assert } from "chai"
import { isDifferentText } from "../src/is-different-text"

suite("isDifferentText")

test("same text", function() {
  assert.isFalse(isDifferentText("one", "one"))
})

test("different text", function() {
  assert.isTrue(isDifferentText("one", "two"))
})

test("text with different case", function() {
  assert.isTrue(isDifferentText("one", "ONE"))
})
