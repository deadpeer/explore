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

import React from 'react'

import {
  IO,
  Graph,
  run,
  log,
  select,
  update,
  toStream,
  toAtom,
  observe,
  pool,
  react,
  timer,
  fork,
} from '../shared/ion.js'
import {
  go,
  pipe,
  map,
  chain,
} from '../shared/base.js'
import {
  mount,
  onEvent,
  withState,
  withEffect,
} from '../shared/ion-html.js'

const main = function * () {
  const graph = yield Graph ()
  // const user = graph . user ()
  // yield log (user)

  const selection = pipe (
    select ('a'),
    select ('b'),
    select ('c'),
    select ('d'),
    select ('e'),
  ) (graph)

  const atom = toAtom (selection)

  const updateA = onEvent (update ({ value: 'a' }) (selection))
  const updateB = onEvent (update ({ value: 'b' }) (selection))

  const Value = withEffect (log ('hello world')) (
    withState (atom) (({ message, value }) => (
      <div>
        {`${message} ${value}`}
      </div>
    ))
  )

  const html = (
    <div>
      <button onClick={updateA}>set a</button>
      <button onClick={updateB}>set b</button>

      <Value message='hello' />
    </div>
  )

  yield mount (html)
}

run (main)
