import code from './mocks/code'
import * as extractor from '../src/extractor'
import { expect } from 'chai'

describe('getTrnsFromCode', () => {
  it('should return the expected trns from the code', () => {
    const expectedTrns = [{
      key: 'common.helloName',
      body: 'Hello, {NAME}!',
      params: ['NAME']
    }]
    expect(extractor.getTrnsFromCode(code)).to.eql(expectedTrns)
  })
})
