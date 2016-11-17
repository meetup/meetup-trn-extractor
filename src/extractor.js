// @flow
import glob from 'glob'
import * as babylon from 'babylon'
import traverse from 'babel-traverse'
import fs from 'fs'
import path from 'path'

let defaultBabylonConfig = {
  sourceType: 'module',
  plugins: ['flow']
}

export default (globPattern: string, babylonConfig?: Object): Promise<Object[]> => new Promise((resolve, reject) => {
  if (babylonConfig) {
    Object.assign(defaultBabylonConfig, babylonConfig)
  }
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

export const getTrnsFromFilePath = (filePath: string): Promise<Object> => new Promise((resolve, reject) => {
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      reject(err)
      throw err
    }
    const trns = getTrnsFromCode(content)
    resolve({ file: path.resolve(filePath), trns })
  })
})

export const getTrnsFromCode = (code: string, config?: Object = defaultBabylonConfig): any[] => {
  let trns: any = []
  traverse(babylon.parse(code, config), {
    enter (path) {
      if (isTrnCall(path)) {
        const args = path.node.arguments
        const params = getTrnParams(path)
        trns.push({
          key: args[0].value,
          body: args[1].value,
          params
        })
      }
    }
  })
  return trns
}

export const getTrnParams = (path: Object): string[] => {
  let params = []
  if (path.node.arguments[2]) {
    path.node.arguments[2].properties.forEach(prop => {
      params.push(prop.key.name)
    })
  }
  return params
}
export const isTrnCall = (path: Object): boolean => {
  return path.node.type === 'CallExpression' &&
    typeof path.node.callee.name === 'string' &&
    path.node.callee.name.toLowerCase() === 'trn' &&
    path.node.arguments.length >= 2
}
