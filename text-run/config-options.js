const jsDiffConsole = require('jsdiff-console')
const PrettifierConfiguration = require('../dist/prettifier-configuration.js')
  .PrettifierConfiguration

module.exports = async function(activity) {
  const documentedOptions = activity.nodes
    .textInNodesOfType('strong')
    .map(s => s.substr(0, s.length - 1))
    .sort()
  const actualOptions = Object.keys(PrettifierConfiguration.defaults).sort()
  jsDiffConsole(documentedOptions, actualOptions)
}
