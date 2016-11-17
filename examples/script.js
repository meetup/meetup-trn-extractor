import Trn from './trn'

function something () {
  return 'hello world'
}
const someTrnWithParam = Trn('common.helloName', 'Hello, {NAME}!', { NAME: 'Mike' })

export default function () {
  something()
  return Trn('some.key', 'Some default copy here!')
}
