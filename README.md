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

```
./node_modules/.bin/meetup-trn-extractor [options]

Options:
  --files, -f               glob pattern for input files (wrap in '', or escape
                            * with \*)                       [string] [required]
  --outfile, -o             Send the output to a file                   [string]
  --exclude-empty-trns, -x  Exclude files that do not contain TRNs     [boolean]
  --help                    Show help                                  [boolean]

Examples:
  ./node_modules/.bin/meetup-trn-extractor
  --files='src/**/*!(.test).js'
  --outfile=output.json
  --exclude-empty-trns

  ./node_modules/.bin/meetup-trn-extractor -f src/\*\*/\*!(.test).js
  -o output.json
```

### Node

```js
import extractor from 'meetup-trn-extractor'

// extractor(globPattern: string, babylonConfig?: Object) => Promise<Object[]>
extractor('src/**/*.js').then((trns: Object[]) => console.log(trns))
```

## Example output

```json
[
  {
    "file": "/usr/local/git_repo/meetup-trunk/static/script/mu/shared/validator.js",
    "trns": []
  },
  {
    "file": "/usr/local/git_repo/meetup-trunk/static/script/mu/shared/validatorRules.js",
    "trns": [
      {
        "key": "validation.isChecked",
        "body": "This checkbox is required.",
        "params": []
      },
      {
        "key": "validation.error.minLength",
        "body": "Should be at least {MIN} characters",
        "params": [
          "MIN"
        ]
      }
    ]
  }
]
```

## Caveats

This currently does not extract trns from `trn` calls in the following formats

```js
  // don't concat strings
  trn('some.key', 'some ' + 'copy') // won't work
  trn(['some', 'key'].join('.'), 'some copy') // won't work

  trn('some.key', 'some copy') // will work
```
