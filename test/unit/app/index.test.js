describe('index test', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  test('Test server and message bus listener started', async () => {
    const startServer = require('../../../app/server/start-server')
    const messagingService = require('../../../app/messaging/service')
    jest.mock('../../../app/server/start-server')
    jest.mock('../../../app/messaging/service')
    await require('../../../app/index') // potentially fix this as await require imports is not recommended
    expect(startServer).toHaveBeenCalledTimes(1)
    expect(messagingService.start).toHaveBeenCalledTimes(1)
  })

  test('Unhandled promise rejection', async () => {
    const messagingService = require('../../../app/messaging/service')
    require('../../../app/server/start-server')
    jest.mock('../../../app/messaging/service')
    jest.mock('../../../app/server/start-server')
    const error = new Error('mock error')
    jest.spyOn(process, 'on').mockImplementation((event, handler) => {
      if (event === 'unhandledRejection') {
        handler(error)
      }
    })
    jest.spyOn(process, 'exit').mockImplementation((exitCode) => {
      // do nothing
    })
    await require('../../../app/index') // potentially fix this as await require imports is not recommended
    expect(process.on).toBeCalledWith('unhandledRejection', expect.any(Function))
    expect(process.exit).toBeCalledTimes(1)
    expect(messagingService.stop).toHaveBeenCalledTimes(1)
  })
})
