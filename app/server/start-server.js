const server = require('./server')
const waitingListSchedulerPlugin = require('../plugins').waitingListSchedulerPlugin

const startServer = async () => {
  await server.start()
  await server.register(waitingListSchedulerPlugin)
  console.log('Server running on %s', server.info.uri)
}

module.exports = startServer
