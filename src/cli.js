#! /usr/bin/env node

// @flow
import extractor from './extractor'
import fs from 'fs'
import * as utils from './utils'
// npm run build && chmod +x lib/cli.js && lib/cli.js '/Users/mspencer/repos/meetup/static/script/mu/shared/**/*.js' --outfile=output.json --only-files-with-trns
import yargs from 'yargs'

export const exec = (argv: Object): void => {
  const globPattern: string = argv['files']
  const outFile: string | null = argv['outfile']
  const excludeEmptyTrns: boolean | null = argv['exclude-empty-trns']

  if (globPattern) {
    extractor(globPattern)
      .then(extractorOutput => {
        if (excludeEmptyTrns) {
          extractorOutput = extractorOutput.filter(utils.hasTrns)
        }
        const formattedOutput = JSON.stringify(extractorOutput, null, 2)
        if (outFile) {
          fs.writeFile(outFile, formattedOutput, (err) => {
            if (err) { throw err }
            console.log(`TRNs from ${extractorOutput.length} files have been saved to ${outFile}`)
            process.exit(0)
          })
        } else {
          console.log(formattedOutput)
          process.exit(0)
        }
      })
      .catch(err => {
        console.error(err)
        process.exit(2)
      })
  } else {
    console.error('glob pattern required')
    process.exit(1)
  }
}

if ((require: any).main === module) {
  const argv: Object = yargs
    .usage('$0 [options]')
    .option('files', {
      alias: 'f',
      demand: true,
      describe: 'glob pattern for input files (wrap in \'\', or escape * with \\*)',
      type: 'string'
    })
    .option('outfile', {
      alias: 'o',
      demand: false,
      describe: 'Send the output to a file',
      type: 'string'
    })
    .option('exclude-empty-trns', {
      alias: 'x',
      demand: false,
      describe: 'Exclude files that do not contain TRNs',
      type: 'boolean'
    })
    .help('help')
    .example('$0 --files=\'src/**/*!(.test).js\' --outfile=output.json --exclude-empty-trns')
    .example('$0 -f src/\\*\\*/\\*!(.test).js -o output.json')
    .argv
  exec(argv)
}
