const colors = {
  'brand-primary': 'hsla(214, 84%, 56%, 1)',
  'brand-secondary': 'hsla(202, 71%, 52%, 1)',
  'brand-tertiary': 'hsla(195, 86%, 64%, 1)',
  'shade-1': 'hsla(0, 0%, 100%, 1)',
  'shade-2': 'hsla(0, 0%, 95%, 1)',
  'shade-3': 'hsla(0, 0%, 88%, 1)',
  'shade-4': 'hsla(0, 0%, 74%, 1)',
  'shade-5': 'hsla(0, 0%, 51%, 1)',
  'shade-6': 'hsla(0, 0%, 31%, 1)',
  'shade-7': 'hsla(0, 0%, 20%, 1)',
  'glyph-normal': 'hsla(0, 0%, 100%, 1)',
  'glyph-alt': 'hsla(0, 0%, 100%, 0.9)',
  'glyph-dark': 'hsla(0, 0%, 0%, 1)',
}

const each = ({ addVariant, e }) =>
  addVariant('each', ({ modifySelectors, separator }) =>
    modifySelectors(
      ({ className }) => `.${e(`each${separator}${className}`)} > *`,
    ),
  )

const first = ({ addVariant, e }) =>
  addVariant('first', ({ modifySelectors, separator }) =>
    modifySelectors(
      ({ className }) =>
        `.${e(`first${separator}${className}`)} > *:first-child`,
    ),
  )

const last = ({ addVariant, e }) =>
  addVariant('last', ({ modifySelectors, separator }) =>
    modifySelectors(
      ({ className }) => `.${e(`last${separator}${className}`)} > *:last-child`,
    ),
  )

module.exports = {
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors,
    },
  },
  variants: {
    margin: ['each', 'first', 'last'],
  },
  plugins: [each, first, last],
}
