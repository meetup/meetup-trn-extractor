import { expect } from 'chai'
import sinon from 'sinon'
import Extractor, { defaultConfig } from '../src/Extractor'

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
    extractor = new Extractor()
  })

  describe('constructor', () => {
    it('should set the default options', () => {
      expect(extractor.config).to.eql(defaultConfig)
    })
    it('should override the default options', () => {
      extractor = new Extractor({
        babylonConfig: { override: true },
        trnFnName: 'override'
      })
      expect(extractor.config.babylonConfig).to.eql({ override: true })
      expect(extractor.config.trnFnName).to.eql('override')
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
      extractor.getTrnsFromFilePath(testFilePath)
        .then(expectedObject => {
          expect(expectedObject).to.eql({
            file: testFilePath,
            trns: testTrnValue
          })
          done()
        })
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
    it('should return the correct content', done => {
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
    })
    it('should reject on error', (done) => {
      const mockFs = {
        readFile (path, encoding, cb) {
          cb(new Error('error'))
        }
      }
      extractor.getFileContents('somefile.js', mockFs)
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
      expect(extractor.hasTrns({ trns: [] })).to.be.false
    })
    it('should return true when there are trns', () => {
      expect(extractor.hasTrns({ trns: [1] })).to.be.true
    })
  })

  describe('extract', () => {
    it('should resolve with the expected trn json', sinon.test(function (done) {
      const mockTrnOutput = [{ testing: true }]
      const globMock = (pattern, callback) => { callback(null, []) }
      this.stub(Extractor.prototype, 'globMatchSuccess')
        .returns(new Promise(resolve => resolve(mockTrnOutput)))
      extractor.extract('*.js', globMock).then(trns => {
        expect(trns).to.eql(mockTrnOutput)
        done()
      })
    }))
    it('should reject with a glob error', sinon.test(function (done) {
      const errorMsg = 'error'
      const globMock = (pattern, callback) => { callback(errorMsg, []) }
      this.stub(Extractor.prototype, 'globMatchSuccess')
        .returns(new Promise(resolve => resolve([])))
      extractor.extract('*.js', globMock).catch(err => {
        expect(err).to.equal(errorMsg)
        done()
      })
    }))
    it('should reject with a globMatchSuccess error', sinon.test(function (done) {
      const errorMsg = 'error'
      const globMock = (pattern, callback) => { callback(null, []) }
      this.stub(Extractor.prototype, 'globMatchSuccess')
        .returns(new Promise((resolve, reject) => reject(errorMsg)))
      extractor.extract('*.js', globMock).catch(err => {
        expect(err).to.equal(errorMsg)
        done()
      })
    }))
  })

  describe('globMatchSuccess', () => {
    it('resolve with the values of the `matches` promises', sinon.test(function (done) {
      this.stub(Extractor.prototype, 'getTrnsFromFilePath')
        .returns(new Promise(resolve => resolve('test value')))
      extractor.globMatchSuccess(['match1', 'match2', 'match3']).then(result => {
        expect(result).to.eql(['test value', 'test value', 'test value'])
        done()
      })
    }))
  })
})
