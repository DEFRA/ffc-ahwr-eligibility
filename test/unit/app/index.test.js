describe('index test', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  test('Test server and message bus listener started', async () => {
    jest.mock('../../../app/server/start-server', () => jest.fn())
    jest.mock('../../../app/auto-eligibility/register-your-interest/message-receiver', () => ({
      start: jest.fn(),
      stop: jest.fn()
    }))
    const startServer = require('../../../app/server/start-server')
    const messagingService = require('../../../app/auto-eligibility/register-your-interest/message-receiver')
    await require('../../../app/index') // potentially fix this as await require imports is not recommended
    expect(startServer).toHaveBeenCalledTimes(1)
    expect(messagingService.start).toHaveBeenCalledTimes(1)
  })

  test('Unhandled promise rejection', async () => {
    jest.mock('../../../app/auto-eligibility/register-your-interest/message-receiver', () => ({
      start: jest.fn(),
      stop: jest.fn()
    }))
    jest.mock('../../../app/server/start-server', () => jest.fn())
    const error = new Error('mock error')
    jest.spyOn(process, 'on').mockImplementation((event, handler) => {
      if (event === 'unhandledRejection') {
        handler(error)
      }
    })
    jest.spyOn(process, 'exit').mockImplementation((exitCode) => {
      // do nothing
    })
    const consoleErrorSpy = jest.spyOn(console, 'error')
    const messagingService = require('../../../app/auto-eligibility/register-your-interest/message-receiver')
    require('../../../app/server/start-server')
    await require('../../../app/index') // potentially fix this as await require imports is not recommended
    expect(process.on).toBeCalledWith('unhandledRejection', expect.any(Function))
    expect(process.exit).toBeCalledTimes(1)
    expect(messagingService.stop).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
  })
})
