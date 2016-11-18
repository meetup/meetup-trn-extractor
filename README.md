# Meetup TRN Extractor

A utility to extract copy from JavaScript files for translation

## Installation

`npm i --save meetup-trn-extractor`

## Example usage

### CLI

meetup-trn-extractor 'glob'

EG: `node_modules/.bin/meetup-trn-extractor 'src/**/*.js'`

### Node

```js
import extractor from 'meetup-trn-extractor'

// extractor(globPattern: string, babylonConfig?: Object)
extractor('src/**/*.js').then(trns => console.log(trns))
```
