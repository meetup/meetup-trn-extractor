// @flow
import fs from 'fs'
import path from 'path'
import * as babylon from 'babylon'
import traverse from 'babel-traverse'

export const isTrnCall = (path: Object): boolean => {
  return path.node.type === 'CallExpression' &&
    typeof path.node.callee.name === 'string' &&
    path.node.callee.name.toLowerCase() === 'trn' &&
    path.node.arguments.length >= 2
}

export const getTrnKeyFromPath = (path: Object): string => {
  const args: Object[] = path.node && path.node.arguments || []
  return args[0] ? args[0].value : ''
}

export const getTrnBodyFromPath = (path: Object): string => {
  const args: Object[] = path.node && path.node.arguments || []
  return args[1] ? args[1].value : ''
}

export const getTrnParamsFromPath = (path: Object): string[] => {
  let params: string[] = []
  const paramsArg = path.node.arguments[2]
  if (paramsArg && paramsArg.properties && paramsArg.properties.length) {
    paramsArg.properties.forEach(prop => {
      params.push(prop.key.name || prop.key.value)
    })
  }
  return params
}

type getFileContentsType = (filePath: string, fs?: Object) => Promise<string | Object>
export const getFileContents: getFileContentsType = (filePath, _fs = fs) =>
  new Promise((resolve, reject) => {
    _fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        reject(err)
        throw err
      }
      resolve(content)
    })
  })

export const getTrnsFromCode = (data: Object): Object[] => {
  let trns: Object[] = []
  const babylonConfig = { sourceType: 'module', plugins: ['flow'] }
  try {
    traverse(babylon.parse(data.code, babylonConfig), {
      enter (path) {
        if (isTrnCall(path)) {
          trns.push({
            key: getTrnKeyFromPath(path),
            body: getTrnBodyFromPath(path),
            params: getTrnParamsFromPath(path)
          })
        }
      }
    })
  } catch (err) {
    console.warn(`Skipping TRN extraction for ${path.resolve(data.filePath)} (unable to traverse)`)
  }
  return trns
}
