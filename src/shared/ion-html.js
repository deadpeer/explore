import _h from 'mutant/html-element'
import Value from 'mutant/value'
import send from 'mutant/send'
import computed from 'mutant/computed'
import when from 'mutant/when'

import { IO, run, isStream, isAtom, isIO, observe, react, get } from './ion.js'
import { go } from './base.js'

export const h = _h

export const mount =
  html => IO (() => document.body . appendChild (html))

export const onEvent =
  f => event => isIO (f)
    ? run (f)
    : run (f (event))

export const Observable =
  m => go (IO) (function * () {
    const value = Value ()

    if (isStream (m)) {
      yield observe (v => IO (() => value . set (v))) (m)
    }

    if (isAtom (m)) {
      yield get (v => IO (() => value . set (v))) (m)
      yield react (v => IO (() => value . set (v))) (m)
    }

    return value
  })

