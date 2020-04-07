import { assert } from "chai"
import { prettify } from "./prettify"

suite("prettify")

test("no options", function () {
  assert.equal(prettify("a  =1", "filename.ts", {}), "a = 1;\n")
})
