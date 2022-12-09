describe('index test', () => {
  test('Test server and message bus listener started', async () => {
    const startServer = require('../../../app/server/start-server')
    const messagingService = require('../../../app/messaging/service')
    jest.mock('../../../app/server/start-server')
    jest.mock('../../../app/messaging/service')
    await require('../../../app/index') // potentially fix this as await require imports is not recommended
    expect(startServer).toHaveBeenCalledTimes(1)
    expect(messagingService.start).toHaveBeenCalledTimes(1)
  })
})
