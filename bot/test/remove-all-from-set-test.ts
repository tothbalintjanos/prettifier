import { assert } from "chai"
import { removeAllFromSet } from "../src/remove-all-from-set"

suite("removeAllFromSet")

test("removing values", function() {
  const s = new Set<string>()
  s.add("one")
  s.add("three")
  removeAllFromSet(s, ["one", "two"])
  assert.deepEqual(["three"], Array.from(s))
})
