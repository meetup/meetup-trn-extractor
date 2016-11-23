import { expect } from 'chai'
import sinon from 'sinon'
import * as extractor from '../src/extractor'
import * as utils from '../src/utils'

describe('extractor', () => {
  describe('getTrnsFromFilePath', () => {
    it('should return a promise resolving with the correct content', sinon.test(function (done) {
      const testFilePath = 'test/file/path'
      const testTrnValue = 'test trn value'
      this.stub(utils, 'getFileContents')
        .returns(new Promise(resolve => resolve()))
      this.stub(utils, 'getTrnsFromCode')
        .returns(testTrnValue)
      extractor.getTrnsFromFilePath(testFilePath)
        .then(expectedObject => {
          expect(expectedObject).to.eql({
            file: testFilePath,
            trns: testTrnValue
          })
          done()
        })
        .catch(done)
    }))
  })
})
