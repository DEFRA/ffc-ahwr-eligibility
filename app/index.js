const startServer = require('./server/start-server')
const unhandledRejection = require('./exception/unhandled-rejection')
const { start: startMessageService, stop: stopMessageService } = require('./auto-eligibility/register-your-interest/service')

process.on('unhandledRejection', async (err) => {
  await stopMessageService()
  unhandledRejection(err)
})

module.exports = (async () => {
  await startServer()
  await startMessageService()
})()
