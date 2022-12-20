describe('Init Server Test', () => {

  let waitingListSchedulerPlugin
  let server

  beforeAll(() => {
    jest.resetModules()
    jest.resetAllMocks()
    waitingListSchedulerPlugin = require('../../../../app/plugins').waitingListSchedulerPlugin
    jest.mock('../../../../app/plugins')
    server = require('../../../../app/server/server')
    jest.mock('../../../../app/server/server')
  })

  test('Should start server', async () => {
    const startServer = require('../../../../app/server/start-server')
    await startServer()
    expect(server.start).toHaveBeenCalledTimes(1)
    expect(server.register).toHaveBeenCalledWith(waitingListSchedulerPlugin)
  })
})
