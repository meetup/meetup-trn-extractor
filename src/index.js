// @flow
import extractor from './extractor'

const args = process.argv.slice(2)
const globPattern = args[0]

if (globPattern) {
  extractor(globPattern)
    .then(args => {
      console.log(JSON.stringify(args, null, 2))
      process.exit(0)
    })
    .catch(err => {
      console.log(err)
      process.exit(2)
    })
} else {
  console.log('glob pattern required')
  process.exit(1)
}
