describe('Init Server Test', () => {
  test('Should start server', async () => {
    const server = require('../../../../app/server/server')
    jest.mock('../../../../app/server/server')
    const startServer = require('../../../../app/server/start-server')
    await startServer()
    expect(server.start).toHaveBeenCalledTimes(1)
  })
})
