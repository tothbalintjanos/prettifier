import { assert } from "chai"
import { prettify } from "../src/prettify"

suite("prettify")

test("no options", function() {
  assert.equal(prettify("a  =1", "filename.ts", {}), "a = 1;\n")
})
