const server = require('./server')
const messageService = require('./messaging/service')

const init = async () => {
  await server.start()
  await messageService.start()
  console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', async (err) => {
  console.error(err)
  await messageService.stop()
  process.exit(1)
})

init()
