const MOCK_NOW = new Date()

describe('app-insights:setup', () => {
  const OLD_ENV = process.env
  let logSpy
  let errorSpy
  const MOCK_START_AUTOMATIC_COLLECTION_OF_TELEMETRY = jest.fn()
  let appInsights

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('applicationinsights', () => {
      const original = jest.requireActual('applicationinsights')
      return {
        ...original,
        setup: jest.fn(() => ({
          start: MOCK_START_AUTOMATIC_COLLECTION_OF_TELEMETRY
        })),
        defaultClient: {
          context: {
            keys: { cloudRole: 'mock_cloud_role' },
            tags: {}
          }
        }
      }
    })
    appInsights = require('applicationinsights')

    logSpy = jest.spyOn(console, 'log')
    errorSpy = jest.spyOn(console, 'error')
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  afterEach(() => {
    process.env = OLD_ENV
    jest.clearAllMocks()
    jest.resetModules()
  })

  test.each([
    {
      toString: () => 'both process.env.APPLICATIONINSIGHTS_CONNECTION_STRING and process.env.APPINSIGHTS_CLOUDROLE are set',
      given: {
        process: {
          env: {
            APPLICATIONINSIGHTS_CONNECTION_STRING: 'conn_str',
            APPINSIGHTS_CLOUDROLE: 'cloud_role'
          }
        }
      },
      when: {
      },
      expect: {
        consoleLogs: [
          `${MOCK_NOW.toISOString()} app-insights:setup`,
          `${MOCK_NOW.toISOString()} app-insights:running...`
        ]
      }
    }
  ])('%s', async (testCase) => {
    process.env = testCase.given.process.env

    const setup = require('../../../app/app-insights/setup')
    setup()

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(appInsights.setup).toHaveBeenCalledWith(
      testCase.given.process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
    )
    expect(MOCK_START_AUTOMATIC_COLLECTION_OF_TELEMETRY).toHaveBeenCalled()
    expect(appInsights.defaultClient.context.tags[
      appInsights.defaultClient.context.keys.cloudRole
    ]).toEqual(
      testCase.given.process.env.APPINSIGHTS_CLOUDROLE
    )
  })

  test.each([
    {
      toString: () => 'process.env.APPLICATIONINSIGHTS_CONNECTION_STRING not set',
      given: {
        process: {
          env: {
            APPLICATIONINSIGHTS_CONNECTION_STRING: undefined,
            APPINSIGHTS_CLOUDROLE: undefined
          }
        }
      },
      when: {
      },
      expect: {
        consoleLogs: [
          `${MOCK_NOW.toISOString()} app-insights:setup`,
          `${MOCK_NOW.toISOString()} app-insights:not running!`
        ]
      }
    },
    {
      toString: () => 'process.env.APPINSIGHTS_CLOUDROLE not set',
      given: {
        process: {
          env: {
            APPLICATIONINSIGHTS_CONNECTION_STRING: 'conn_str',
            APPINSIGHTS_CLOUDROLE: undefined
          }
        }
      },
      when: {
      },
      expect: {
        consoleLogs: [
          `${MOCK_NOW.toISOString()} app-insights:setup`,
          `${MOCK_NOW.toISOString()} app-insights:not running!`
        ]
      }
    }
  ])('%s', async (testCase) => {
    process.env = testCase.given.process.env

    const setup = require('../../../app/app-insights/setup')
    setup()

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
  })

  test.each([
    {
      toString: () => 'config error',
      given: {
        process: {
          env: {
            APPLICATIONINSIGHTS_CONNECTION_STRING: 123,
            APPINSIGHTS_CLOUDROLE: undefined
          }
        }
      },
      when: {
      },
      expect: {
        error: new Error('"applicationInsightsConnectionString" must be a string'),
        errorLogs: [
          `${MOCK_NOW.toISOString()} app-insights:config: "applicationInsightsConnectionString" must be a string`
        ]
      }
    }
  ])('%s', async (testCase) => {
    process.env = testCase.given.process.env

    expect(() => {
      const setup = require('../../../app/app-insights/setup')
      setup()
    }).toThrowError(testCase.expect.error)

    testCase.expect.errorLogs.forEach(
      (errorLog, idx) => expect(errorSpy).toHaveBeenNthCalledWith(idx + 1, errorLog)
    )
  })
})
