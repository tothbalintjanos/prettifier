const { cyan } = require("chalk")
const fs = require("fs").promises
const path = require("path")

module.exports = async function verifyMakeCommand(args) {
  const expected = args.nodes
    .text()
    .replace(/make\s*/, "")
    .trim()
  args.name(`verify Make command ${cyan(expected)} exists`)
  const makefilePath = path.join(args.configuration.sourceDir, path.dirname(args.file), "Makefile")
  const makefileContent = await fs.readFile(makefilePath, "utf8")
  const commands = makefileContent
    .split(/\r?\n/)
    .filter(lineDefinesMakeCommand)
    .map(extractMakeCommand)
  if (!commands.includes(expected)) {
    throw new Error(`Make command ${cyan(expected)} not found in ${commands}`)
  }
}

/**
 * Returns whether the given line from a Makefile
 * defines a Make command
 */
function lineDefinesMakeCommand(line) {
  return makeCommandRE.test(line)
}
const makeCommandRE = /^[^ ]+:/

/**
 * returns the defined command name
 * from a Makefile line that defines a Make command
 */
function extractMakeCommand(line) {
  return line.split(":")[0]
}
