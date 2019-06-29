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
} from '../shared/ion-html.js'

const main = function * () {
  const stream = yield toStream (
    pipe (
      select ('a'),
      select ('b'),
      select ('c'),
      select ('d'),
      select ('e'),
    ) (Graph ())
  )

  yield observe (log) (stream)

  const html = h ('button', {
    'ev-click': run (log (update ({ data: '' }) (selection)))
  }, 'update')

  yield mount (html)
}

run (main)

