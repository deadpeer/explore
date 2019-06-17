import 'setimmediate'

import h from 'mutant/html-element'
import Struct from 'mutant/struct'
import send from 'mutant/send'
import computed from 'mutant/computed'
import when from 'mutant/when'
import monet from 'monet'
import { pipe, compose } from 'ramda'
import {
  Future,
  fork,
  isFuture,
  resolve,
  ap as futureAp,
  map as futureMap,
  chain as futureChain,
} from 'fluture'

import { seed } from './seed.js'

import './index.css'

const { Either, Left, Right, IO } = monet

// functional
const noop = () => {}
const useless = IO(noop)

// monad
const ERROR_MISSING_OF_METHOD = 'Object does not have an `of` method.'
const ERROR_MISSING_CHAIN_METHOD = 'Object does not have a `chain` method.'

const of = M => v => {
  const operation = M.of
    ? M.of
    : M.unit
    ? M.unit
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
const evaluate = f => f()
const execute = io => io.run()
const run = f => execute(evaluate(f))

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

  return recurse(null)
}

// math
const ERROR_DIVIDE_BY_ZERO = 'Cannot divide by zero.'

const multiply = x => y => x * y
const add = x => y => x + y
const divide = x => y => {
  if (y === 0) throw new Error(ERROR_DIVIDE_BY_ZERO)

  return x / y
}

// execution
const future = flow(Future)(function*() {
  const foo = yield resolve(5)
  const bar = yield resolve(10)

  return multiply(foo)(bar)
})

fork(console.error)(console.log)(future)

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
