const PrettifierConfiguration = require('../dist/prettifier-configuration.js')
  .PrettifierConfiguration
const yaml = require('js-yaml')
const diff = require('jsdiff-console')

module.exports = async function(activity) {
  const documented = activity.nodes.text()
  const expected = yaml.safeDump(PrettifierConfiguration.defaults, {
    sortKeys: true
  })
  diff(documented, expected)
}
