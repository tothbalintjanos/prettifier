import { expect } from 'chai'
import shouldIgnoreBranch from '../src/should-ignore-branch'

describe('shouldIgnoreBranch', function() {
  it('botConfig match', function() {
    const actual = shouldIgnoreBranch('master', {
      'exclude-branches': ['master']
    })
    expect(actual).to.be.true
  })
  it('botConfig mismatch', function() {
    const actual = shouldIgnoreBranch('foo', {
      'exclude-branches': ['master']
    })
    expect(actual).to.be.false
  })
  it('no botConfig', function() {
    const actual = shouldIgnoreBranch('foo', null)
    expect(actual).to.be.false
  })
})
