import { expect } from 'chai'
import isDifferentText from '../src/is-different-text'

describe('isDifferentText', function() {
  it('returns false for identical text', () => {
    expect(isDifferentText('one', 'one')).to.be.false
  })
  it('returns true for different text', () => {
    expect(isDifferentText('one', 'two')).to.be.true
  })
  it('returns true for text with different case', () => {
    expect(isDifferentText('one', 'ONE')).to.be.true
  })
})
