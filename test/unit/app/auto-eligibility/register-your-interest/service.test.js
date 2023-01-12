let mocksubscribe
let mockClose
let service

describe(('Consume register your interest message tests'), () => {
  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
    jest.mock('ffc-messaging')
    jest.mock('../../../../../app/auto-eligibility/register-your-interest/process-register-your-interest-request', () => ({}))
    mocksubscribe = jest.fn().mockImplementation(() => {})
    mockClose = jest.fn().mockImplementation(() => {})
    const { MessageReceiver } = require('ffc-messaging')
    MessageReceiver.prototype.subscribe = mocksubscribe
    MessageReceiver.prototype.closeConnection = mockClose
    require('../../../../../app/auto-eligibility/register-your-interest/process-register-your-interest-request')
    service = require('../../../../../app/auto-eligibility/register-your-interest/service')
  })

  test('successfully fetched register your interest message', async () => {
    await service.start()
    expect(mocksubscribe).toHaveBeenCalledTimes(1)
  })

  test('successfully closed session', async () => {
    await service.start()
    await service.stop()
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  test('catch error starting message receiver', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error')
    mocksubscribe.mockImplementation(() => {
      throw new Error('Some Error')
    })
    await service.start()
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
  })
})
