import fs from 'fs'
import babel from 'rollup-plugin-babel'
import copy from 'rollup-plugin-copy'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import replace from 'rollup-plugin-replace'

import postcssPresetEnv from 'postcss-preset-env'
import simplevars from 'postcss-simple-vars'
import nested from 'postcss-nested'
import cssimport from 'postcss-import'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

export default {
  input: ['src/web/index.js'],
  output: [
    {
      file: 'public/bundle.js',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    babel({
      exclude: 'node_modules/**',
      plugins: [
        '@babel/plugin-proposal-export-default-from',
      ],
      presets: ['@babel/react'],
    }),

    resolve({
      mainFields: ['module', 'main', 'browser'],
    }),

    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/react/index.js': ['useState', 'useEffect'],
      },
    }),

    postcss({
      plugins: [
        postcssPresetEnv({ stage: 0 }),
        simplevars(),
        nested(),
        cssimport(),
        cssnano(),
        autoprefixer(),
        tailwind(),
      ],
      extensions: ['.css'],
    }),

    copy({
      targets: [{ src: 'static/**/*', dest: 'public' }],
    }),

    serve({
      contentBase: 'public',
      host: '0.0.0.0',
      port: 3000,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }),

    livereload({
      host: '0.0.0.0',
      port: 3001,
      https: {
        key: fs.readFileSync('./ssl/host.key'),
        cert: fs.readFileSync('./ssl/host.cert'),
      },
      watch: ['src', 'static'],
    }),
  ],
}
