const logger = require('../logger')
const server = require('./server')
const waitingListSchedulerPlugin = require('../plugins').waitingListSchedulerPlugin

const startServer = async () => {
  await server.start()
  await server.register(waitingListSchedulerPlugin)
  logger.logTrace('Server running', {
    uri: server.info.uri
  })
}

module.exports = startServer
