// @flow
import Trn from './trn'

function somethingElse(): string {
  return 'hello world trn'
}

const someTrn = Trn('blah.something.key', 'this is some crazy trn string')

export default function () {
  const b = somethingElse()
  if (!b) {
    return 'doooood'
  }
  return Trn('some.key', 'Some default copy here!')
}

const someOtherTrn = Trn('common.helloName', 'Hello, {NAME}!', { NAME: 'Mike' })
