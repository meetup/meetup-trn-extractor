# Meetup TRN Extractor

[![Build Status](https://travis-ci.org/mikespencer/meetup-trn-extractor.svg?branch=master)](https://travis-ci.org/mikespencer/meetup-trn-extractor)
[![Coverage Status](https://coveralls.io/repos/github/mikespencer/meetup-trn-extractor/badge.svg?branch=master)](https://coveralls.io/github/mikespencer/meetup-trn-extractor?branch=master)


A utility to extract copy from JavaScript files for translation

## Installation

`npm i --save meetup-trn-extractor`

## Example usage

This will look for `trn` (case insensitive) function calls within the searched files in the format:
```js
  trn(key: string, body: string, params?: Object)
```

### CLI

meetup-trn-extractor 'glob' [outfile]

`node_modules/.bin/meetup-trn-extractor 'src/**/*.js'` to send extracted trns to stdout

`node_modules/.bin/meetup-trn-extractor 'src/**/*.js' trns.json` to save extracted trns to `trns.json`

### Node

```js
import extractor from 'meetup-trn-extractor'

// extractor(globPattern: string, babylonConfig?: Object) => Promise<Object[]>
extractor('src/**/*.js').then((trns: Object[]) => console.log(trns))
```

## Caveats

This currently does not extract trns from `trn` calls in the following formats

```js
  // don't concat strings
  trn('some.key', 'some ' + 'copy') // won't work
  trn(['some', 'key'].join('.'), 'some copy') // won't work

  trn('some.key', 'some copy') // will work
```
