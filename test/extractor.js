import chai, { expect } from 'chai'
import spies from 'chai-spies'
import * as extractor from '../src/extractor'

chai.use(spies)

describe('getTrnsFromCode', () => {
  it('should return the expected trns from the code with params', () => {
    const code = `const myTrn = Trn('common.helloName', 'Hello, {NAME}!', { NAME: 'World' })`
    const expectedTrns = [{
      key: 'common.helloName',
      body: 'Hello, {NAME}!',
      params: ['NAME']
    }]
    expect(extractor.getTrnsFromCode(code)).to.eql(expectedTrns)
  })
  it('should return the expected trns from the code without params', () => {
    const code = `const myTrn = Trn('common.helloWorld', 'Hello, World!')`
    const expectedTrns = [{
      key: 'common.helloWorld',
      body: 'Hello, World!',
      params: []
    }]
    expect(extractor.getTrnsFromCode(code)).to.eql(expectedTrns)
  })
  it('should return an empty array if the code does not contain any trns', () => {
    expect(extractor.getTrnsFromCode(`const a = 'abc'`)).to.eql([])
  })
})

describe('getTrnParams', () => {
  it('should return the trn params', () => {
    const astPath = {
      node: {
        arguments: [1, 2, {
          properties: [
            { key: { name: 'SOME_NAME' } },
            { key: { name: 'SOME_OTHER_NAME' } }
          ]
        }]
      }
    }
    expect(extractor.getTrnParams(astPath)).to.eql(['SOME_NAME', 'SOME_OTHER_NAME'])
  })
  it('should return an empty array if there are no params', () => {
    const astPath = {
      node: {
        arguments: [1, 2]
      }
    }
    expect(extractor.getTrnParams(astPath)).to.eql([])
  })
})

describe('isTrnCall', () => {
  it('should recognise a trn call', () => {
    const astPath = {
      node: {
        type: 'CallExpression',
        callee: {
          name: 'trn'
        },
        arguments: [1, 2]
      }
    }
    expect(extractor.isTrnCall(astPath)).to.equal(true)
  })
  it('should recognise an uppercase TRN call', () => {
    const astPath = {
      node: {
        type: 'CallExpression',
        callee: {
          name: 'TRN'
        },
        arguments: [1, 2]
      }
    }
    expect(extractor.isTrnCall(astPath)).to.equal(true)
  })
  it('should recognise a function that is not a trn call', () => {
    const astPath = {
      node: {
        type: 'CallExpression',
        callee: {
          name: 'notTrn'
        },
        arguments: [1, 2]
      }
    }
    expect(extractor.isTrnCall(astPath)).to.equal(false)
  })
})
