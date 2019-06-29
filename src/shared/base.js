import {
  isFuture as _isFuture,
  Future as _Future,
  map as futureMap,
  chain as futureChain,
  ap as futureAp,
} from 'fluture'
import monet from 'monet'
import loGet from 'lodash.get'
import {
  pipe as _pipe,
  compose as _compose,
  prop as _prop,
  mergeDeepRight,
} from 'ramda'

import { streamReduce } from './ion.js'
import { isStream } from './ion.js'

export const { Maybe, Either, List, Reader, Validation } = monet

// exports
export const pipe = _pipe
export const compose = _compose
export const prop = _prop
export const isFuture = _isFuture
export const Future = _Future

// number
export const ERROR_DIVIDE_BY_ZERO = 'Cannot divide by zero.'

export const multiply =
  x => y => x * y

export const add =
  x => y => x + y

export const divide =
  x => y => {
    if (x === 0) throw new Error (ERROR_DIVIDE_BY_ZERO)

    return y / x
  }

// string
export const isString =
  string => typeof string === 'string'

export const toUpperCase =
  string => string . toUpperCase ()

export const toLowerCase =
  string => string . toLowerCase ()

export const capitalize =
  string => string . charAt (0) . toUpperCase () + string . slice (1)

// functional
export const noop =
  () => {}

export const id =
  v => v

export const of =
  M => v =>
    M.of
      ? M . of (v)
      : M.unit
      ? M . unit (v)
      : M.pure
      ? M . pure (v)
      : M === Future
      ? resolve (v)
      : M === Promise
      ? Promise . resolve (v)
      : M === Object
      ? assign ({}) (v)
      : null

export const chain =
  f => m =>
    m.chain
      ? m . chain (f)
      : m.flatMap
      ? m . flatMap (f)
      : m.bind
      ? m . bind (f)
      : m.then
      ? m . then (f)
      : isFuture (m)
      ? m . pipe (futureChain (f))
      : isObject (m)
      ? f (m)
      : null

export const reduce =
  r => i => m =>
  isStream (m)
    ? streamReduce (r) (i) (m)
    : m.reduce
    ? () => m . reduce (r, i)
    : null

export const ap =
  f => m =>
    isFuture (m)
      ? futureAp (f) (m)
      : m.ap (f)

export const map =
  f => m =>
    isFuture (m)
    ? m . pipe (futureMap (f))
    : m . map
    ? m . map (f)
    : isObject (m)
    ? assign ({}) (f(m))
    : isString (m)
    ? (s => f (s)) (m)
    : null

// object (record)
export const assign = mergeDeepRight

export const isObject =
  m => typeof m === 'object'

export const dig =
  p => (o, d = null) => loGet (o, p, d)

// either
export const Left = Either.Left
export const Right = Either.Right

export const isRight = e =>
  e . isRight ()

export const isLeft =
  e => e . isLeft ()

export const right =
  e => e . right ()

export const left =
  e => e . left ()

export const containsLeft =
  v => e => v === left (e)

export const containsRight =
  v => e => v === right (e)

// go (do notation)
export const go =
  M => g => {
    const doing = g ()

    const recurse = v => {
      const current = doing . next (v)

      if (current.done) {
        return of (M) (current.value)
      }

      return chain (recurse) (current.value)
    }

    return recurse ()
  }

