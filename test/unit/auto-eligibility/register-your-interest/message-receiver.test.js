const { when, resetAllWhenMocks } = require('jest-when')

const MOCK_NOW = new Date()

describe('"register your interest" message receiver', () => {
  let messageReceiver
  let processMessage

  let mockProcessRegisterYourInterest = jest.fn(() => {})
  const mockCompleteMessage = jest.fn(() => {})
  const mockDeadLetterMessage = jest.fn(() => {})
  const mockClose = jest.fn(() => {})
  const mockTrackException = jest.fn(() => {})

  let logSpy
  let errorSpy

  beforeAll(async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../app/auto-eligibility/register-your-interest/register-your-interest.config', () => ({
      registerYourInterestRequestQueue: {
        address: 'mockQueueAddress',
        type: 'queue'
      }
    }))

    jest.mock('../../../../app/config/notify', () => ({
      apiKey: 'mockApiKey'
    }))

    jest.mock('../../../../app/auto-eligibility/register-your-interest/process-register-your-interest')
    mockProcessRegisterYourInterest = require(
      '../../../../app/auto-eligibility/register-your-interest/process-register-your-interest'
    )

    jest.mock('../../../../app/app-insights/telemetry-client', () => ({
      trackException: mockTrackException
    }))

    jest.mock('@azure/service-bus', () => {
      return {
        ServiceBusClient: jest.fn().mockImplementation(() => {
          return {
            createReceiver: () => ({
              subscribe: async (handlers) => {
                processMessage = handlers.processMessage
              },
              completeMessage: mockCompleteMessage,
              deadLetterMessage: mockDeadLetterMessage,
              close: mockClose
            }),
            close: mockClose
          }
        })
      }
    })

    messageReceiver = require('../../../../app/auto-eligibility/register-your-interest/message-receiver')

    logSpy = jest.spyOn(console, 'log')
    errorSpy = jest.spyOn(console, 'error')
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  afterEach(async () => {
    await messageReceiver.stop()
    expect(mockClose).toHaveBeenCalledTimes(2)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    resetAllWhenMocks()
  })

  test.each([
    {
      toString: () => 'when a "register your interest" message is processed successfuly',
      given: {
        message: {
          body: {
            email: 'business@email.com'
          }
        }
      },
      expect: {
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Ready to receive "register your interest" messages...`,
          `${MOCK_NOW.toISOString()} "register your interest" message has been successfully processed: ${JSON.stringify({
            email: 'business@email.com'
          })}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    await messageReceiver.start()
    await processMessage(testCase.given.message)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(mockProcessRegisterYourInterest).toHaveBeenCalledTimes(1)
    expect(mockProcessRegisterYourInterest).toHaveBeenCalledWith(testCase.given.message.body)
    expect(mockCompleteMessage).toHaveBeenCalledTimes(1)
    expect(mockCompleteMessage).toHaveBeenCalledWith(testCase.given.message)
  })

  test.each([
    {
      toString: () => 'when a "register your interest" message fails to be processed',
      given: {
        message: {
          body: {
            email: 'business@email.com'
          }
        }
      },
      when: {
        error: new Error('fail')
      },
      expect: {
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Ready to receive "register your interest" messages...`
        ],
        errorLogs: [
          `${MOCK_NOW.toISOString()} Error while processing "register your interest" message: ${JSON.stringify({
            email: 'business@email.com'
          })}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    when(mockProcessRegisterYourInterest)
      .calledWith({
        email: 'business@email.com'
      })
      .mockRejectedValue(testCase.when.error)

    await messageReceiver.start()
    await processMessage(testCase.given.message)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(
        idx + 1,
        consoleLog
      )
    )
    testCase.expect.errorLogs.forEach(
      (errorLog, idx) => expect(errorSpy).toHaveBeenNthCalledWith(
        idx + 1,
        errorLog,
        testCase.when.error
      )
    )
    expect(mockProcessRegisterYourInterest).toHaveBeenCalledTimes(1)
    expect(mockProcessRegisterYourInterest).toHaveBeenCalledWith(testCase.given.message.body)
    expect(mockDeadLetterMessage).toHaveBeenCalledTimes(1)
    expect(mockDeadLetterMessage).toHaveBeenCalledWith(testCase.given.message)
    expect(mockTrackException).toHaveBeenCalledTimes(1)
    expect(mockTrackException).toHaveBeenCalledWith({
      exception: testCase.when.error
    })
  })

  test.each([
    {
      toString: () => 'when the message receiver fails to start',
      given: {
        message: {
          body: {
            email: 'business@email.com'
          }
        }
      },
      when: {
        error: new Error('unable to start')
      },
      expect: {
        errorLogs: [
          `${MOCK_NOW.toISOString()} Error while starting "register your interest" message receiver: ${JSON.stringify({
            address: 'mockQueueAddress',
            type: 'queue'
          })}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    const mockSubscribe = async () => {
      throw testCase.when.error
    }
    jest.mock('@azure/service-bus', () => {
      return {
        ServiceBusClient: jest.fn().mockImplementation(() => {
          return {
            createReceiver: () => ({
              subscribe: mockSubscribe
            })
          }
        })
      }
    })

    const messageReceiver = require('../../../../app/auto-eligibility/register-your-interest/message-receiver')
    await messageReceiver.start()

    testCase.expect.errorLogs.forEach(
      (errorLog, idx) => expect(errorSpy).toHaveBeenNthCalledWith(
        idx + 1,
        errorLog,
        testCase.when.error
      )
    )
    expect(mockTrackException).toHaveBeenCalledTimes(1)
    expect(mockTrackException).toHaveBeenCalledWith({
      exception: testCase.when.error
    })
  })
})
