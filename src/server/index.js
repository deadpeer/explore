const server = require('server')

const { get, post } = server.router
const { render } = server.reply

server({ port: 8080 }, [post('/', ctx => console.log(ctx.data))])
