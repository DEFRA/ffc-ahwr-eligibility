const startServer = require('./server/start-server')
const unhandledRejection = require('./exception/unhandled-rejection')
const { start: startMessageService, stop: stopMessageService } = require('./messaging/service')

startServer()
startMessageService()

process.on('unhandledRejection', async (err) => {
  await stopMessageService()
  unhandledRejection(err)
})
