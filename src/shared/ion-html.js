import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
// import _h from 'react-hyperscript'

import { assign } from './base.js'
import { IO, isIO, run, observe, isStream, isAtom, react, get } from './ion.js'

// export const h = _h

export const mount =
  html => IO (() => {
    const root = document . createElement ('div')

    document . body . appendChild (root)

    ReactDOM . render (html, root)
  })

export const onEvent =
  f => event => isIO (f)
    ? run (f)
    : run (f (event))

export const withState =
  reactive => render => (props = {}) => {
    [state, setState] = useState (props)

    if (isStream (reactive)) {
      run (
        observe (
          v => IO (
            () => setState (assign (props, v))
          )
        ) (reactive)
      )
    }

    if (isAtom (reactive)) {
      run (
        react (reactive) (
          v => IO (
            () => setState (assign (props, v))
          )
        )
      )
    }

    return render (state)
  }

export const withEffect =
  io => render => props => {
    useEffect (() => {
      run (io)
    }, [])

    return render (props)
  }


// export const Observable =
//   m => go (IO) (function * () {
//     const value = Value ()
//
//     if (isStream (m)) {
//       yield observe (v => IO (() => value . set (v))) (m)
//     }
//
//     if (isAtom (m)) {
//       yield get (v => IO (() => value . set (v))) (m)
//       yield react (v => IO (() => value . set (v))) (m)
//     }
//
//     return value
//   })

