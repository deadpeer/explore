import 'setimmediate'

import h from 'mutant/html-element'
import Struct from 'mutant/struct'
import send from 'mutant/send'
import computed from 'mutant/computed'
import when from 'mutant/when'

import { seed } from './seed.js'

import './index.css'

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
