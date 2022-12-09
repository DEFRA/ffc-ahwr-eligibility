const startServer = require('./server/init-server')
const unhandledRejection = require('./exception/unhandledRejection')
const { start: startMessageService, stop: stopMessageService } = require('./messaging/service')

startServer()
startMessageService()

process.on('unhandledRejection', async (err) => {
  await stopMessageService()
  unhandledRejection(err)
})
