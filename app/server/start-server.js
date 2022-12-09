const server = require('./server')

const startServer = async () => {
  await server.start()
  console.log('Server running on %s', server.info.uri)
}

module.exports = startServer
