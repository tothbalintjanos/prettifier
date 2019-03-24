import { expect } from 'chai'
import { PrettifierConfiguration } from '../src/prettifier-configuration'
const test = it

describe('PrettifierConfiguration', () => {
  describe('.shouldIgnoreBranch', function() {
    test('name listed in config', function() {
      const config = new PrettifierConfiguration({
        excludeBranches: ['master']
      })
      expect(config.shouldIgnoreBranch('master')).to.be.true
    })
    test('name not listed in config', function() {
      const config = new PrettifierConfiguration({
        excludeBranches: ['master']
      })
      expect(config.shouldIgnoreBranch('foo')).to.be.false
    })
    test('no botConfig', function() {
      const config = new PrettifierConfiguration({})
      expect(config.shouldIgnoreBranch('foo')).to.be.false
    })
  })

  describe('.shouldPrettify', function() {
    test('ignores node_modules out of the box', async function() {
      const config = new PrettifierConfiguration({})
      const result = await config.shouldPrettify('node_modules/foo/bar.js')
      expect(result).to.be.false
    })
    test('prettifierConfig excludeFiles contains the folder name', async function() {
      const config = new PrettifierConfiguration({ excludeFiles: ['dist'] })
      const result = await config.shouldPrettify('dist/foo.js')
      expect(result).to.be.false
    })
    test('allows other files', async function() {
      const config = new PrettifierConfiguration({})
      const result = await config.shouldPrettify('foo.js')
      expect(result).to.be.true
    })
  })
})
