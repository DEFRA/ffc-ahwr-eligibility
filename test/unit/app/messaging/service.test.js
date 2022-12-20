let mocksubscribe
let mockClose
let service

describe(('Consume register your interest message tests'), () => {
  beforeAll(() => {
    jest.resetModules()
    jest.resetAllMocks()
    jest.mock('ffc-messaging')
    jest.mock('../../../../app/register-your-interest/messaging/process-register-your-interest-request', () => ({}))
    require('../../../../app/register-your-interest/messaging/process-register-your-interest-request')
    mocksubscribe = jest.fn()
    mockClose = jest.fn()
    const { MessageReceiver } = require('ffc-messaging')
    MessageReceiver.prototype.subscribe = mocksubscribe
    MessageReceiver.prototype.closeConnection = mockClose
    service = require('../../../../app/messaging/service')
  })

  test('successfully fetched register your interest message', async () => {
    await service.start()
    expect(mocksubscribe).toHaveBeenCalledTimes(1)
  })

  test('successfully closed session', async () => {
    await service.stop()
    expect(mockClose).toHaveBeenCalledTimes(1)
  })
})
