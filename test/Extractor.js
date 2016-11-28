import { expect } from 'chai'
import sinon from 'sinon'
import Extractor from '../src/Extractor'

const getMockTrnPath = () => ({
  node: {
    type: 'CallExpression',
    callee: {
      name: 'Trn'
    },
    arguments: [
      { value: 'some.trn' },
      { value: 'Some TRN' },
      { properties: [
        { key: { name: 'SOME_NAME' } },
        { key: { value: 'SOME_OTHER_NAME' } }
      ]}
    ]
  }
})

describe('Extractor', () => {
  let extractor
  beforeEach(() => {
    extractor = new Extractor({
      trnFnName: 'trn'
    })
  })

  describe('getTrnsFromFilePath', () => {
    it('should return a promise resolving with the correct content', sinon.test(function (done) {
      const testFilePath = 'test/file/path'
      const testTrnValue = 'test trn value'
      this.stub(Extractor.prototype, 'getFileContents')
        .returns(new Promise(resolve => resolve()))
      this.stub(Extractor.prototype, 'getTrnsFromCode')
        .returns(testTrnValue)
      Extractor.prototype.getTrnsFromFilePath(testFilePath)
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

  describe('isTrnCall', () => {
    it('should recognise a trn call', () => {
      expect(extractor.isTrnCall(getMockTrnPath())).to.be.true
    })

    it('should recognise an uppercase TRN call', () => {
      let path = getMockTrnPath()
      path.node.callee.name = 'TRN'
      expect(extractor.isTrnCall(path)).to.be.true
    })

    it('should recognise that a function is not a trn call', () => {
      let path = getMockTrnPath()
      path.node.callee.name = 'notTrn'
      expect(extractor.isTrnCall(path)).to.be.false
    })
  })

  describe('getTrnKeyFromPath', () => {
    it('should return the correct key', () => {
      expect(extractor.getTrnKeyFromPath(getMockTrnPath())).to.equal('some.trn')
    })
    it('should return an empty string if the path is invalid', () => {
      expect(extractor.getTrnKeyFromPath({})).to.equal('')
    })
  })

  describe('getTrnBodyFromPath', () => {
    it('should return the correct key', () => {
      expect(extractor.getTrnBodyFromPath(getMockTrnPath())).to.equal('Some TRN')
    })
    it('should return an empty string if the path is invalid', () => {
      expect(extractor.getTrnBodyFromPath({})).to.equal('')
    })
  })

  describe('getTrnParamsFromPath', () => {
    it('should return the trn params', () => {
      expect(extractor.getTrnParamsFromPath(getMockTrnPath())).to.eql(['SOME_NAME', 'SOME_OTHER_NAME'])
    })

    it('should return an empty array if there are no params', () => {
      let path = { node: { arguments: [1, 2] } }
      path.node.arguments = [1, 2]
      expect(extractor.getTrnParamsFromPath(path)).to.eql([])
    })
  })

  describe('getFileContents', done => {
    it('should return the correct content', (done) => {
      const mockFs = {
        readFile (path, encoding, cb) {
          cb(null, 'some content')
        }
      }
      extractor.getFileContents('somefile.js', mockFs)
        .then(content => {
          expect(content).to.equal('some content')
          done()
        })
        .catch(done)
    })
    it('should reject on error', (done) => {
      const mockFs = {
        readFile (path, encoding, cb) {
          cb(new Error('error'))
        }
      }
      extractor.getFileContents('somefile.js', mockFs)
        .then(done)
        .catch(err => {
          expect(err).to.be.defined
          done()
        })
    })
  })

  describe('getTrnsFromCode', () => {
    it('should find 2 trn in the code', () => {
      const code = `
        const myTrn = Trn('common.helloName', 'Hello, {NAME}!', { NAME: 'World' })
        const anotherTrn = Trn('common.goodbye', 'Goodbye!')
      `
      expect(extractor.getTrnsFromCode({ code })).to.have.lengthOf(2)
    })
    it('should return return key, body and param keys', () => {
      const code = `const myTrn = Trn('common.helloName', 'Hello, {NAME}!', { NAME: 'World' })`
      expect(extractor.getTrnsFromCode({ code })[0]).to.have.all.keys('key', 'body', 'params')
    })
    it('should return an empty array if the code does not contain any trns', () => {
      expect(extractor.getTrnsFromCode({ code: `const a = 'abc'` })).to.eql([])
    })
  })

  describe('hasTrns', () => {
    it('should return false when there are no trns', () => {
      expect(extractor.hasTrns({ trns: [] })).to.eql(false)
    })
    it('should return true when there are trns', () => {
      expect(extractor.hasTrns({ trns: [1] })).to.eql(true)
    })
  })
})