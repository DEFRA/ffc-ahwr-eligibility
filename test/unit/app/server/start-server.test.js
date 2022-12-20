describe('Init Server Test', () => {
  let plugins
  let server
  let waitingListSchedulerPlugin

  beforeAll(() => {
    jest.resetModules()
    jest.resetAllMocks()
    jest.mock('../../../../app/plugins', () => ({
      waitingListSchedulerPlugin: {}
    }))
    jest.mock('../../../../app/server/server')

    server = require('../../../../app/server/server')
    plugins = require('../../../../app/plugins')
    waitingListSchedulerPlugin = plugins.waitingListSchedulerPlugin
  })

  test('Should start server', async () => {
    const startServer = require('../../../../app/server/start-server')
    await startServer()
    expect(server.start).toHaveBeenCalledTimes(1)
    expect(server.register).toHaveBeenCalledWith(waitingListSchedulerPlugin)
  })
})
