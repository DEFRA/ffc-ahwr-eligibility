const { when, resetAllWhenMocks } = require('jest-when')

const MOCK_NOW = new Date()

describe('"register your interest" message receiver', () => {
  let messageReceiver
  let processMessage

  let mockProcessRegisterYourInterest = jest.fn(() => {})
  const mockCompleteMessage = jest.fn(() => {})
  const mockDeadLetterMessage = jest.fn(() => {})
  const mockClose = jest.fn(() => {})
  let mockTrackException = jest.fn(() => {})
  
  let logSpy
  let errorSpy

  beforeAll(async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

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
            sbi: '123456789',
            crn: '1234567890',
            email: 'business@email.com'
          }
        }
      },
      expect: {
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Ready to receive "register your interest" messages...`,
          `${MOCK_NOW.toISOString()} Register your interest message has been processed`
        ]
      }
    }
  ])('%s', async (testCase) => {
    await messageReceiver.start()
    await processMessage(testCase.given.message)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(mockProcessRegisterYourInterest).toHaveBeenCalledWith(testCase.given.message.body)
    expect(mockCompleteMessage).toHaveBeenCalledWith(testCase.given.message)
  })

  test.each([
    {
      toString: () => 'when a "register your interest" message fails to be processed',
      given: {
        message: {
          body: {
            sbi: '123456789',
            crn: '1234567890',
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
          `${MOCK_NOW.toISOString()} Error while processing register your interest message`
        ]
      }
    }
  ])('%s', async (testCase) => {
    when(mockProcessRegisterYourInterest)
      .calledWith({
        sbi: '123456789',
        crn: '1234567890',
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
    expect(mockProcessRegisterYourInterest).toHaveBeenCalledWith(testCase.given.message.body)
    expect(mockDeadLetterMessage).toHaveBeenCalledWith(testCase.given.message)
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
            sbi: '123456789',
            crn: '1234567890',
            email: 'business@email.com'
          }
        }
      },
      when: {
        error: new Error('unable to start')
      },
      expect: {
        errorLogs: [
          `${MOCK_NOW.toISOString()} Error starting message receiver`
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
    expect(mockTrackException).toHaveBeenCalledWith({
      exception: testCase.when.error
    })
  })
})
