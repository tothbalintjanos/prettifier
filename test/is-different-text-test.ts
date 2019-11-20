import { assert } from "chai"
import { isDifferentText } from "../src/is-different-text"

test("isDifferentText", function() {
  assert.isFalse(isDifferentText("one", "one"), "same text")
  assert.isTrue(isDifferentText("one", "two"), "different text")
  assert.isTrue(isDifferentText("one", "ONE"), "text with different case")
})
