let mocksubscribe
let mockClose
let service

describe(('Consume register your interest message tests'), () => {
  const MOCK_TRACK_EXCEPTION = jest.fn(() => {})

  beforeAll(() => {
    jest.mock('applicationinsights', () => {
      const original = jest.requireActual('applicationinsights')
      return {
        ...original,
        defaultClient: {
          trackException: MOCK_TRACK_EXCEPTION
        }
      }
    })
  })

  afterAll(() => {
    jest.resetModules()
  })

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
    jest.mock('ffc-messaging')
    jest.mock('../../../../app/auto-eligibility/register-your-interest/process-register-your-interest', () => ({}))
    mocksubscribe = jest.fn().mockImplementation(() => {})
    mockClose = jest.fn().mockImplementation(() => {})
    const { MessageReceiver } = require('ffc-messaging')
    MessageReceiver.prototype.subscribe = mocksubscribe
    MessageReceiver.prototype.closeConnection = mockClose
    require('../../../../app/auto-eligibility/register-your-interest/process-register-your-interest')
    service = require('../../../../app/auto-eligibility/register-your-interest/message-receiver')
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
    const expectedError = new Error('Some Error')
    const consoleErrorSpy = jest.spyOn(console, 'error')
    mocksubscribe.mockImplementation(() => {
      throw expectedError
    })
    await service.start()
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    expect(MOCK_TRACK_EXCEPTION).toHaveBeenCalledWith({
      exception: expectedError
    })
  })
})
