const startServer = require('./server/start-server')
const unhandledRejection = require('./exception/unhandled-rejection')
const { start: startMessageService, stop: stopMessageService } = require('./messaging/service')

process.on('unhandledRejection', async (err) => {
  await stopMessageService()
  unhandledRejection(err)
})

module.exports = (async () => {
  try {
    await startServer()
    await startMessageService()
  } catch (ex) {
    console.log(ex, 'server start')
  }
})()
