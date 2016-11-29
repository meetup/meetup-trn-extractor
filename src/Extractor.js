// @flow
import fs from 'fs'
import path from 'path'
import glob from 'glob'
import traverse from 'babel-traverse'
import * as babylon from 'babylon'

export const defaultConfig = {
  babylonConfig: {},
  trnFnName: 'trn'
}

export default class Extractor {
  config: Object;

  constructor (props?: Object = {}) {
    this.config = Object.assign({}, defaultConfig, props)
  }

  extract (globPattern: string, _glob?: Function = glob): Promise<Object[]> {
    return new Promise((resolve, reject) => {
      _glob(globPattern, (err, matches) => {
        if (err) {
          reject(err)
          throw err
        }
        this.globMatchSuccess(matches)
          .then(resolve)
          .catch(reject)
      })
    })
  }

  globMatchSuccess (matches: string[]): Promise<Object[]> {
    return Promise.all(matches.map(this.getTrnsFromFilePath, this))
  }

  getTrnsFromFilePath (filePath: string): Promise<Object> {
    return new Promise((resolve, reject) => {
      let trns: Object[] = []
      this.getFileContents(filePath)
        .then(content => {
          trns = this.getTrnsFromCode({ code: content, filePath })
          resolve({ file: filePath, trns })
        })
        .catch(reject)
    })
  }

  isTrnCall (astPath: Object): boolean {
    return astPath.node.type === 'CallExpression' &&
      typeof astPath.node.callee.name === 'string' &&
      astPath.node.callee.name.toLowerCase() === this.config.trnFnName &&
      astPath.node.arguments.length >= 2
  }

  getTrnKeyFromPath (astPath: Object): string {
    const args: Object[] = astPath.node && astPath.node.arguments || []
    return args[0] ? args[0].value : ''
  }

  getTrnBodyFromPath (astPath: Object): string {
    const args: Object[] = astPath.node && astPath.node.arguments || []
    return args[1] ? args[1].value : ''
  }

  getTrnParamsFromPath (astPath: Object): string[] {
    let params: string[] = []
    const paramsArg = astPath.node.arguments[2]
    if (paramsArg && paramsArg.properties && paramsArg.properties.length) {
      paramsArg.properties.forEach(prop => {
        params.push(prop.key.name || prop.key.value)
      })
    }
    return params
  }

  getFileContents (filePath: string, _fs?: Object = fs): Promise<string | Object> {
    return new Promise((resolve, reject) => {
      _fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
          reject(err)
          throw err
        }
        resolve(content)
      })
    })
  }

  getTrnsFromCode (data: Object): Object[] {
    let trns: Object[] = []
    try {
      traverse(babylon.parse(data.code, this.config.babylonConfig), {
        enter: (astPath) => {
          if (this.isTrnCall(astPath)) {
            trns.push({
              key: this.getTrnKeyFromPath(astPath),
              body: this.getTrnBodyFromPath(astPath),
              params: this.getTrnParamsFromPath(astPath)
            })
          }
        }
      })
    } catch (err) {
      console.warn(`Skipping TRN extraction for ${path.resolve(data.filePath)} (unable to traverse)`)
    }
    return trns
  }

  hasTrns ({ trns }: { trns: Object[] }): boolean {
    return !!trns.length
  }
}
