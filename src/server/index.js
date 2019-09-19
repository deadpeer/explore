const server = require ('server')

const { get, post } = server.router
const { render } = server.reply

server (
  {
    port: 8080,
    ssl: {
      key: './ssl.pem',
      cert: './ssl.cert',
    }
  },
  [
    post ('/', ctx => console . log (ctx.data)),
  ]
)
