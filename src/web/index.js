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

import { run, log } from '../shared/ion.js'
import { Maybe, map, capitalize } from '../shared/base.js'

const main = log (map (capitalize) ('hello world.'))

run (main)

