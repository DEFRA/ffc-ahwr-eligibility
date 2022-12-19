describe('Init Server Test', () => {
  test('Should start server', async () => {
    const server = require('../../../../app/server/server')
    jest.mock('../../../../app/server/server')
    const waitingListSchedulerPlugin = require('../../../../app/plugins').waitingListSchedulerPlugin
    jest.mock('../../../../app/plugins')
    const startServer = require('../../../../app/server/start-server')
    await startServer()
    expect(server.start).toHaveBeenCalledTimes(1)
    expect(server.register).toHaveBeenCalledWith(waitingListSchedulerPlugin)
  })
})
