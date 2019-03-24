import { expect } from 'chai'
import { prettify } from '../src/prettify'

describe('prettify', () => {
  it('prettifies text', () => {
    expect(prettify('a  =1', 'filename.ts', {})).to.equal('a = 1;\n')
  })
})
