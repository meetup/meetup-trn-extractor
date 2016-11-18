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

type getTrnsFromFilePathPath = (filePath: string) => Promise<Object>
export const getTrnsFromFilePath: getTrnsFromFilePathPath = filePath => new Promise((resolve, reject) => {
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      reject(err)
      throw err
    }
    const trns = getTrnsFromCode(content)
    resolve({ file: path.resolve(filePath), trns })
  })
})

type getTrnsFromCodeType = (code: string, config?: Object) => any[]
export const getTrnsFromCode: getTrnsFromCodeType = (code, config = defaultBabylonConfig) => {
  let trns: any[] = []
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
  let params: string[] = []
  const paramsArg = path.node.arguments[2]
  if (paramsArg && paramsArg.properties && paramsArg.properties.length) {
    paramsArg.properties.forEach(prop => {
      params.push(prop.key.name || prop.key.value)
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

type extractorType = (globPattern: string, babylonConfig?: Object) => Promise<Object[]>
const extractor: extractorType = (globPattern, babylonConfig) => new Promise((resolve, reject) => {
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

export default extractor
