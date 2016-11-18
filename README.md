# Meetup TRN Extractor

A utility to extract copy from JavaScript files for translation

## Installation

`npm i --save meetup-trn-extractor`

## Example usage

### CLI

meetup-trn-extractor 'glob' [outfile]

`node_modules/.bin/meetup-trn-extractor 'src/**/*.js'` to send extracted trns to stdout

`node_modules/.bin/meetup-trn-extractor 'src/**/*.js' trns.json` to save extracted trns to `trns.json`

### Node

```js
import extractor from 'meetup-trn-extractor'

// extractor(globPattern: string, babylonConfig?: Object)
extractor('src/**/*.js').then((trns: Object[]) => console.log(trns))
```
