// @flow
import glob from 'glob'
import * as utils from './utils'

export const getTrnsFromFilePath = (filePath: string): Promise<Object> =>
  new Promise((resolve, reject) => {
    let trns: Object[] = []
    utils.getFileContents(filePath)
      .then(content => {
        trns = utils.getTrnsFromCode({ code: content, filePath })
        resolve({ file: filePath, trns })
      })
      .catch(reject)
  })

const extractor = (globPattern: string): Promise<Object[]> => new Promise((resolve, reject) => {
  glob(globPattern, (err, matches) => {
    if (err) {
      reject(err)
      throw err
    }
    globMatchSuccess(matches)
      .then(resolve)
      .catch(reject)
  })
})

export const globMatchSuccess = (matches: string[]): Promise<Object[]> =>
  Promise.all(matches.map(getTrnsFromFilePath))

export default extractor
