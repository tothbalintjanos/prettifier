import { expect } from 'chai'
import shouldPrettify from './should-prettify'

describe('shouldPrettify', function() {
  it('ignores node_modules out of the box', async function() {
    const result = await shouldPrettify('node_modules/foo/bar.js', {})
    expect(result).to.be.false
  })
  it('botConfig exclude-files folder name', async function() {
    const result = await shouldPrettify('dist/foo.js', {
      'exclude-files': ['dist']
    })
    expect(result).to.be.false
  })
  it('allows other files', async function() {
    const result = await shouldPrettify('foo.js', {})
    expect(result).to.be.true
  })
})
