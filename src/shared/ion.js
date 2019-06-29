import 'setimmediate'

import axios from 'axios'
import monet from 'monet'
import ee from 'event-emitter'
import {
  of as mostOf,
  map as mostMap,
  chain as mostChain,
  ap as mostAp,
  reduce as mostReduce,
  fromEvent as mostFromEvent,
  from as _from,
  fromPromise,
  awaitPromises,
} from 'most'
import {
  fork as futureFork,
  ap as futureAp,
  map as futureMap,
  chain as futureChain,
  value as futureValue,
  isFuture as _isFuture,
  resolve as _resolve,
  reject as _reject,
  encaseP as _encaseP,
  promise as _promise,
  fold as _fold,
  Future as _Future,
} from 'fluture'
import Gun from 'gun/gun'

import {
  map,
  chain,
  reduce,
  ap,
  noop,
  go,
} from './base.js'

export const { IO } = monet

// exports
export const Future = _Future
export const isFuture = _isFuture
export const resolve = _resolve
export const reject = _reject
export const encaseP = _encaseP
export const promise = _promise
export const fold = _fold
export const from = _from

// io
export const run =
  io => io . run ()

export const runWith =
  f => v => run (f (v))

export const useless =
  () => IO (noop)

export const isIO =
  m => !!m.effectFn

export const log =
  value => IO (() => console . log (value))

export const report =
  error => IO (() => console . error (error))

export const now =
  () => IO (() => new Date ())

export const interval =
  io => ms => IO (() => {
    const interval = setInterval (() => run (io), ms)

    return IO (() => clearInterval (interval))
  })

// future
export const fork =
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

export const value =
  resolve => future =>
    map (
      cancel => IO (() => cancel ())
    ) (
      IO (() => futureValue (
        isIO (resolve) ? () => run (resolve) : runWith (resolve)
      ) (future))
    )

export const http =
  method => (url, data, config) => encaseP (axios) ({ method, url, data, config })

export const timer =
  ms => (v = null) => Future ((_, resolve) => {
    const timeout = setTimeout (() => resolve (v), ms)

    return () => clearTimeout (timeout)
  })

// stream
export const UPDATE_STREAM = 'UPDATE_STREAM'

export const isStream = stream => !!stream.source

export const subscribe = observer => stream =>
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

export const drain =
  stream => IO (() => stream . drain ()) . map (promise => encaseP (() => promise) ())

export const observe =
  f => stream => map (
    promise => encaseP (() => promise) ()
  ) (
    IO (() => stream . observe (
        v => run (f (v))
    ))
  )

export const streamReduce =
  reducer => initial => stream =>
    encaseP (() => mostReduce (reducer, initial, stream)) ()

export const fromEvent =
  type => emitter => mostFromEvent (type, emitter)

export const fromAtom =
  atom => go (IO) (function * () {
    const emitter = Emitter ()
    const stream = fromEvent (UPDATE_STREAM) (emitter)

    yield react (atom) (
      v => emit (emitter) (UPDATE_STREAM) (v)
    )

    return stream
  })

export const fromFuture =
  future => fromPromise (promise (future))

export const awaitFutures =
  stream => awaitPromises (
    stream . map (future => promise (future))
  )

export const tap =
  effect => stream => stream . tap (
    v => run (effect (v))
  )

export const Stream = {
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
  tap,
}

// atom
export const Atom =
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
    }
  }

export const get =
  a => a . get ()

export const set =
  a => (v, o) => a . set (v, o)

export const react =
  a => f => a . react (f)

export const fuse =
  f => a => b => go (IO) (function * () {
    const av = yield get (a)
    const bv = yield get (b)

    const atom = Atom (f (av) (bv))

    const reaction =
      m => v => go (IO) (function * () {
        const av = yield get (a)
        const bv = yield get (b)

        yield set (atom) (f (av) (bv))
      })

    yield react (a) (reaction (a))
    yield react (b) (reaction (b))

    return atom
  })

export const flatten =
  (...list) => go (IO) (function * () {
    const initial = []

    for (let i = 0 ; i < list.length ; i++) {
      const value = yield get (list[i])
      initial . push (value)
    }

    const atom = Atom (initial)

    for (let i = 0 ; i < list.length ; i++) {
      yield react (list[i]) (value => go (IO) (function * () {
        const current = [...yield get (atom)]

        current[i] = value

        yield set (atom) (current)
      }))
    }

    return atom
  })

Atom.of = Atom
Atom.get = get
Atom.set = set
Atom.react = react
Atom.fuse = fuse
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

export const Emitter =
  () => new EmitterInstance ()

export const emit =
  emitter => type => value => emitter . emit (type) (value)

 // graph

export const Graph = Gun
