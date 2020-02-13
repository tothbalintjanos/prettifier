import { assert } from "chai"
import { concatToSet } from "./concat-to-set"

suite("concatToSet")

test("adding values", function() {
  const s = new Set<string>()
  concatToSet(s, ["one", "two"])
  concatToSet(s, ["one", "three"])
  assert.deepEqual(["one", "two", "three"], Array.from(s))
})
