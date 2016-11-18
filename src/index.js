#! /usr/bin/env node

// @flow
import extractor from './extractor'
import fs from 'fs'

const args: string[] = process.argv.slice(2)
const globPattern: string | null = args[0]
const outfile: string | null = args[1]

if (globPattern) {
  extractor(globPattern)
    .then(args => {
      const output = JSON.stringify(args, null, 2)
      if (outfile) {
        fs.writeFile(outfile, output, (err) => {
          if (err) { throw err }
          console.log(`TRNs from ${args.length} files have been saved to ${outfile}`)
          process.exit(0)
        })
      } else {
        console.log(output)
        process.exit(0)
      }
    })
    .catch(err => {
      console.log(err)
      process.exit(2)
    })
} else {
  console.log('glob pattern required')
  process.exit(1)
}
