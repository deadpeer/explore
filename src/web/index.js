// next
// TODO: get bundle size as small as possible (code splitting)
// TODO: curry all multiple parameter functions
// TODO: type validators (isFunctor, isMonad, isMap, isChain, isOf)

// future
// TODO: fork crocks / monet (use monet IO)
// TODO: fork most (use IO methods)
// TODO: fork fluture (use IO methods)
// TODO: ensure all functions return List rather than array
// TODO: copy useful lodash / ramda functions
// TODO: add typescript definitions
// TODO: fork prettier to implement functional code style

import {
  IO,
  Graph,
  run,
  log,
  select,
  update,
  toStream,
  once,
  observe,
} from '../shared/ion.js'
import {
  go,
  pipe,
  map,
} from '../shared/base.js'
import {
  h,
  mount,
  onEvent,
  Observable,
} from '../shared/ion-html.js'

const main = function * () {
  const graph = yield Graph ()

  const selection = pipe (
    select ('a'),
    select ('b'),
    select ('c'),
    select ('d'),
    select ('e'),
  ) (graph)

  const change =
    v => update ({ data: v }) (selection)

  const stream = yield toStream (selection)
  const value = yield Observable (stream . map (o => o.data))

  const a = h ('button', {
    'ev-click': onEvent (change ('hello'))
  }, 'hello')

  const b = h ('button', {
    'ev-click': onEvent (change ('world'))
  }, 'world')

  const html = h ('div', [a, b, value])

  yield mount (html)

  yield once (change) (selection)
}

run (main)

