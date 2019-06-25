// today
// TODO: stream.tap
// TODO: future.fold
// TODO: future.value

// next
// TODO: curry all multiple parameter functions
// TODO: type validators (isFunctor, isMonad, isMap, isChain, isOf)

// future
// TODO: fork crocks (use monet IO)
// TODO: fork most (use IO methods)
// TODO: fork fluture (use IO methods)
// TODO: ensure all functions return List rather than array
// TODO: copy useful lodash / ramda functions
// TODO: add typescript definitions
// TODO: fork prettier to implement functional code style

import 'setimmediate'

import axios from 'axios'
import monet from 'monet'
import crocks from 'crocks'
import loGet from 'lodash.get'
import {
  pipe,
  compose,
  mergeDeepRight,
} from 'ramda'
import ee from 'event-emitter'
import {
  of as mostOf,
  map as mostMap,
  chain as mostChain,
  ap as mostAp,
  slice as mostSlice,
  reduce as mostReduce,
  fromEvent as mostFromEvent,
  merge,
  mergeArray,
  combine,
  combineArray,
  sample,
  sampleWith,
  zip,
  switchLatest,
  join,
  mergeConcurrently,
  awaitPromises,
  debounce,
  throttle,
  delay,
  multicast,
  timestamp,
  filter,
  skipRepeats,
  skipRepeatsWith,
  transduce,
  take,
  skip,
  since,
  during,
  loop,
  takeWhile,
  skipAfter,
  until,
  continueWith,
  concatMap,
  constant,
  scan,
  from,
  fromPromise,
  periodic,
  empty,
  never,
  iterate,
  unfold,
  generate,
  startWith,
  concat,
  recoverWith,
  throwError,
} from 'most'
import {
  Future,
  fork as futureFork,
  ap as futureAp,
  map as futureMap,
  chain as futureChain,
  isFuture,
  resolve,
  encaseP,
  promise,
} from 'fluture'

import { seed } from './seed.js'

import './index.css'

const { IO } = monet
const { Maybe, Either, List } = crocks

// number
const ERROR_DIVIDE_BY_ZERO = 'Cannot divide by zero.'

const multiply =
  x => y => x * y

const add =
  x => y => x + y

const divide =
  x => y => {
    if (x === 0) throw new Error (ERROR_DIVIDE_BY_ZERO)

    return y / x
  }

// string
const toUpperCase =
  string => string . toUpperCase ()

const toLowerCase =
  string => string . toLowerCase ()

const capitalize =
  string => string . charAt (0) . toUpperCase () + string . slice (1)

// functional
const noop =
  () => {}

const useless =
  () => IO (noop)

const id =
  v => v

const of =
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

const chain =
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

const reduce =
  r => i => m =>
  isStream (m)
    ? reduceStream (r) (i) (m)
    : m.reduce
    ? () => m . reduce (r, i)
    : null

const ap =
  f => m =>
    isFuture (m)
      ? futureAp (f) (m)
      : m.ap (f)

const map =
  f => m =>
    isFuture (m)
    ? m . pipe (futureMap (f))
    : m . map
    ? m . map (f)
    : isObject (m)
    ? assign ({}) (f(m))
    : null

// object
const assign = mergeDeepRight

const isObject =
  m => typeof m === 'object'

const dig =
  p => (o, d = null) => loGet (o, p, d)

// io
const run =
  io => io . run ()

const runWith =
  f => v => run (f (v))

const isIO =
  m => !!m.effectFn

const log =
  value => IO (() => console . log (value))

const report =
  error => IO (() => console . error (error))

const now =
  () => IO (() => new Date ())

const interval =
  io => ms => IO (() => {
    const interval = setInterval (() => run (io), ms)

    return IO (() => clearInterval (interval))
  })

// either
const Left = Either.Left
const Right = Either.Right

const isRight = e =>
  e . isRight ()

const isLeft =
  e => e . isLeft ()

const right =
  e => e . right ()

const left =
  e => e . left ()

const value =
  e => {
    let x

    try {
      x = right (e)
    } catch (error) {
      x = left (e)
    }

    return x
  }

const containsLeft =
  v => e => v === left (e)

const containsRight =
  v => e => v === right (e)

const contains =
  v => e => {
    let x

    try {
      x = right (e)
    } catch (error) {
      x = left (e)
    }

    return x === v
  }

// flow (do notation)
const flow =
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

// http
const http =
  method => (url, data, config) => encaseP (axios) ({ method, url, data, config })

// future
const timer =
  ms => (v = null) => Future ((_, resolve) => {
    const timeout = setTimeout (() => resolve (v), ms)

    return () => clearTimeout (timeout)
  })

const fork =
  reject => resolve => future =>
    map (
      cancel => IO (() => cancel ())
    ) (
      IO (() => futureFork (
        isIO (reject) ? () => run (reject) : runWith (reject)
      ) (
        isIO (resolve) ? () => run (resolve) : runWith (resolve)
      ) (future))
    )

// stream
const UPDATE_STREAM = 'UPDATE_STREAM'

const isStream = stream => !!stream.source

const subscribe = observer => stream =>
  map (
    subscription => IO (() => subscription.unsubscribe ())
  ) (
    IO (() =>
      stream . subscribe ({
        error: error => run (observer . error (error)),
        next: value => run ((observer.next || useless) (value)),
        complete: () => run ((observer.complete || useless)),
      })
    )
  )

const drain =
  stream => IO (() => stream . drain ()) . map (promise => encaseP (() => promise) ())

const observe =
  f => stream => map (
    promise => encaseP (() => promise) ()
  ) (
    IO (() => stream . observe (
        v => run (f (v))
    ))
  )

const reduceStream =
  reducer => initial => stream =>
    encaseP (() => mostReduce (reducer, initial, stream)) ()

const fromEvent =
  type => emitter => mostFromEvent (type, emitter)

const fromAtom =
  atom => flow (IO) (function * () {
    const emitter = Emitter ()
    const stream = fromEvent (UPDATE_STREAM) (emitter)

    yield react (atom) (
      v => emit (emitter) (UPDATE_STREAM) (v)
    )

    return stream
  })

const fromFuture =
  future => fromPromise (promise (future))

const awaitFutures =
  stream => awaitPromises (
    stream . map (future => promise (future))
  )

const Stream = {
  of: mostOf,
  map: mostMap,
  chain: mostChain,
  ap: mostAp,
  slice: mostSlice,
  isStream,
  subscribe,
  drain,
  observe,
  from,
  fromEvent,
  fromAtom,
  fromFuture,
  awaitFutures,
}

// atom
const Atom =
  (v, reducer = (_, c) => c, s) => {
    const state = s || {
      value: v,
      effects: [],
    }

    return {
      get: () => IO (() => state.value),

      set: (n, override) => IO (() => {
        state.value = override ? override (state.value, n) : reducer (state.value, n)

        state.effects . forEach (effect => run (effect (state.value)))
      }),

      react: effect => IO (() => (
        state.effects = state.effects . concat (effect))
      ),

      map: f => Atom (_, reducer, state),

      chain: f => {
        const atom = f (state.value)

        state.effects . forEach (effect => atom . react (effect))

        return atom
      }
    }
  }

const get =
  a => a . get ()

const set =
  a => (v, o) => a . set (v, o)

const react =
  a => f => a . react (f)

const flatten =
  (...list) => flow (IO) (function * () {
    const initial = []

    for (let i = 0 ; i < list.length ; i++) {
      const value = yield get (list[i])
      initial . push (value)
    }

    const atom = Atom (initial)

    for (let i = 0 ; i < list.length ; i++) {
      yield react (list[i]) (value => flow (IO) (function * () {
        const current = [...yield get (atom)]

        current[i] = value

        yield set (atom) (current)
      }))
    }

    return atom
  })

const fuse =
  f => a => b => flow (IO) (function * () {
    const av = yield get (a)
    const bv = yield get (b)

    const atom = Atom (f (av) (bv))

    const reaction =
      m => v => flow (IO) (function * () {
        const av = yield get (a)
        const bv = yield get (b)

        yield set (atom) (f (av) (bv))
      })

    yield react (a) (reaction (a))
    yield react (b) (reaction (b))

    return atom
  })

Atom.of = Atom
Atom.get = get
Atom.set = set
Atom.react = react
Atom.map = map
Atom.chain = chain
Atom.flatten = flatten

// emitter
class EmitterInstance {
  emitEvent (type) {
    return value => IO (() => this . _emit (type, value))
  }

  addEventListener (type, listener) {
    this . on (type, listener)
  }

  removeEventListener (type, listener) {
    this . off (type, listener)
  }
}

ee (EmitterInstance.prototype)

EmitterInstance.prototype._emit = EmitterInstance.prototype.emit
EmitterInstance.prototype.emit = EmitterInstance.prototype.emitEvent

const Emitter =
  () => new EmitterInstance ()

const emit =
  emitter => type => value => emitter . emit (type) (value)



// execution
const getUsersUrl =
  amount => `https://randomuser.me/api?results=${amount}`

const main = flow (IO) (function * () {
  const futures = [
    http ('get') (getUsersUrl (5)),
    http ('get') (getUsersUrl (13)),
    pipe (
      map (v => v * 2),
      chain (amount => http ('get') (getUsersUrl (amount))),
    ) (timer (2000) (7)),
  ]

  const stream = pipe (
    awaitFutures,
    map (payload => dig ('data.results') (payload)),
    map (a => a . map (o => o.name.first)),
  ) (from (futures))

  const future = reduce ((p, c) => p . concat (c)) ([]) (stream)

  const atom = Atom ()

  yield react (atom) (log)

  yield fork (report) (set (atom)) (future)
})

run (main)
