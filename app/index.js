const server = require('./server')
const messageService = require('./messaging/service')

const init = async () => {
  await messageService.start()
  await server.start()
  console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection',async (err) => {
  console.error(err)
  await messageService.stop()
  process.exit(1)
})

init()
