import chai, { expect } from 'chai'
import spies from 'chai-spies'
import * as extractor from '../src/extractor'

chai.use(spies)

const code = `const someTrnWithParam = Trn('common.helloName', 'Hello, {NAME}!', { NAME: 'Mike' })`

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
