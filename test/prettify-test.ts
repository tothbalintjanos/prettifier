import { assert } from "chai"
import { prettify } from "../src/prettify"

test("prettify", () => {
  assert.equal(prettify("a  =1", "filename.ts", {}), "a = 1;\n")
})
