// @flow
import glob from 'glob'
import path from 'path'
import * as utils from './utils'

export const getTrnsFromFilePath = (filePath: string): Promise<Object> =>
  new Promise((resolve, reject) => {
    let trns: Object[] = []
    utils.getFileContents(filePath)
      .then(content => {
        trns = utils.getTrnsFromCode({ code: content, filePath })
        resolve({ file: path.resolve(filePath), trns })
      })
      .catch(reject)
  })

const extractor = (globPattern: string): Promise<Object[]> => new Promise((resolve, reject) => {
  glob(globPattern, (err, matches) => {
    if (err) {
      reject(err)
      throw err
    }
    Promise.all(matches.map(getTrnsFromFilePath))
      .then(resolve)
      .catch(reject)
  })
})

export default extractor
