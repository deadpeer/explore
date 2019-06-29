import _h from 'mutant/html-element'
import Struct from 'mutant/struct'
import send from 'mutant/send'
import computed from 'mutant/computed'
import when from 'mutant/when'

import { IO, run } from '../shared/ion.js'

export const h = _h

export const mount =
  html => IO (() => document.body . appendChild (html))

export const onEvent =
  effect => event => run (effect (event))

