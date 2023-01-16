const server = require('./server')
const waitingListScheduler = require('../auto-eligibility/waiting-list/waiting-list-scheduler')

const startServer = async () => {
  await server.start()
  await server.register(waitingListScheduler)
  console.log(`${new Date().toISOString()} Server running on %s`, server.info.uri)
}

module.exports = startServer
