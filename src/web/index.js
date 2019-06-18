import 'setimmediate'

import h from 'mutant/html-element'
import Struct from 'mutant/struct'
import send from 'mutant/send'
import computed from 'mutant/computed'
import when from 'mutant/when'
import monet from 'monet'
import { pipe, compose } from 'ramda'
import {
  of as mostOf,
  map as mostMap,
  chain as mostChain,
  ap as mostAp,
  slice as mostSlice,
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
  tap,
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
  fromEvent,
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
  isFuture,
  resolve,
  encaseP,
  ap as futureAp,
  map as futureMap,
  chain as futureChain,
} from 'fluture'

import { seed } from './seed.js'

import './index.css'

const { Either, Left, Right, IO } = monet

// functional
const noop = () => {}
const useless = () => IO(noop)

// monad
const ERROR_MISSING_OF_METHOD = 'Object does not have an `of` method.'
const ERROR_MISSING_CHAIN_METHOD = 'Object does not have a `chain` method.'

const of = M => v => {
  const operation = M.of
    ? M.of
    : M.unit
    ? M.unit
    : M.pure
    ? M.pure
    : M === Future
    ? resolve
    : M === Promise
    ? Promise.resolve
    : null

  if (!operation) throw new Error(ERROR_MISSING_OF_METHOD)

  return operation(v)
}

const chain = f => m => {
  const operation = m.chain
    ? m.chain
    : m.flatMap
    ? m.flatMap
    : m.bind
    ? m.bind
    : m.then
    ? m.then
    : isFuture(m)
    ? f => futureChain(f)(m)
    : null

  if (!operation) throw new Error(ERROR_MISSING_CHAIN_METHOD)

  return operation(f)
}
const ap = f => m => (isFuture(m) ? futureAp(f)(m) : m.ap(f))
const map = f => m => (isFuture(m) ? futureMap(f)(m) : m.map(f))

// io
IO.io = f => IO(f)
IO.of = f => IO(f)
IO.unit = f => IO(f)
IO.pure = f => IO(f)

const run = io => io.run()

// either
const isRight = e => e.isRight()
const isLeft = e => e.isLeft()
const right = e => e.right()
const left = e => e.left()

const value = e => {
  let x

  try {
    x = right(e)
  } catch (error) {
    x = left(e)
  }

  return x
}

const containsLeft = v => e => v === left(e)
const containsRight = v => e => v === right(e)

const contains = v => e => {
  let x

  try {
    x = right(e)
  } catch (error) {
    x = left(e)
  }

  return x === v
}

// flow (do notation)
const flow = M => g => {
  const doing = g()

  const recurse = v => {
    const current = doing.next(v)

    if (current.done) {
      return of(M)(current.value)
    }

    return chain(recurse)(current.value)
  }

  return recurse()
}

// math
const ERROR_DIVIDE_BY_ZERO = 'Cannot divide by zero.'

const multiply = x => y => x * y
const add = x => y => x + y
const divide = x => y => {
  if (y === 0) throw new Error(ERROR_DIVIDE_BY_ZERO)

  return x / y
}

// reactive
const ERROR_UNHANDLED_EXCEPTION = 'Unhandled exception in stream.'

const Stream = {
  of: mostOf,
  map: mostMap,
  chain: mostChain,
  ap: mostAp,
  slice: mostSlice,
}

const fork = reject => resolve => future =>
  of(IO)(() =>
    futureFork(() => run(reject()))(() => run(resolve()))(future),
  ).map(cancel => () => IO(() => cancel()))

const subscribe = observer => stream =>
  IO(() =>
    stream.subscribe({
      next: value => run((observer.next || useless)(value)),
      complete: () => run((observer.complete || useless)()),
      error: error => run(observer.error(error)),
    }),
  ).map(subscription => () => IO(() => subscription.unsubscribe()))

// TODO: Future class
// TODO: const reduce = () => {}
// TODO: const drain = () => {}

const observe = createIO => stream =>
  of(IO)(() => stream.observe(v => run(createIO(v)))).map(promise =>
    encaseP(() => promise)(),
  )

// execution
const Log = v => IO(() => console.log(v))
const Report = v => IO(() => console.error(v))

const reportFailure = () => Report('failure')
const logSuccess = () => Log('success')

const stream = of(Stream)(1000)

// const io = observe(Log)(stream).chain(future =>
//   fork(reportFailure)(logSuccess)(future),
// )

const io = subscribe({
  next: Log,
  complete: () => Log('complete'),
  error: Report,
})(stream).chain(unsubscribe => unsubscribe())

run(io)

// run(observable)

// const io = observe(v => console.log(v))(stream).chain(future =>
//   fork(() => console.error('error'))(() => console.log('done'))(future),
// )

// const future = Future((miss, pass) => {
//   const timeout = setTimeout(pass, 3000, 69)
//
//   return () => {
//     console.log('clearing')
//     clearTimeout(timeout)
//   }
// })

// const io = fork(console.error)(console.log)(future).chain(cancel => cancel())

const state = Struct({
  text: 'Test',
  color: 'red',
  value: 0,
})

const isBlue = computed([state.color], color => color === 'blue')

const element = h(
  'div.cool',
  {
    classList: ['m-16', 'cool', state.text],
    style: {
      'background-color': state.color,
    },
  },
  [
    h('div', [state.text, ' ', state.value, ' ', h('strong', 'test')]),
    h('div', [
      when(
        isBlue,
        h(
          'button',
          {
            'ev-click': send(state.color.set, 'red'),
          },
          'Change color to red',
        ),
        h(
          'button',
          {
            'ev-click': send(state.color.set, 'blue'),
          },
          'Change color to blue',
        ),
      ),
    ]),
  ],
)

setTimeout(function() {
  state.text.set('Another value')
}, 5000)

setInterval(function() {
  state.value.set(state.value() + 1)
}, 1000)

setInterval(function() {
  state.set({
    text: 'Retrieved from server (not really)',
    color: '#FFEECC',
    value: 1337,
  })
}, 10000)

document.body.appendChild(element)
