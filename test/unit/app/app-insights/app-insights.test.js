describe('App Insights', () => {
  const logSpy = jest.spyOn(console, 'log')

  const MOCK_CONNECTION_STRING = 'mock_conn_string'

  const MOCK_APP_INSIGHTS_SETUP = jest.fn(() => ({ start: jest.fn() }))

  let appInsights

  beforeEach(() => {
    jest.mock('applicationinsights', () => {
      const original = jest.requireActual('applicationinsights')
      return {
        ...original,
        setup: MOCK_APP_INSIGHTS_SETUP,
        defaultClient: {
          context: {
            keys: { cloudRole: 'mock_role_name' },
            tags: {}
          },
          trackException: jest.fn((item) => null)
        }
      }
    })
    appInsights = require('applicationinsights')
  })

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  describe('setup', () => {
    test('when there is app insights config defined', () => {
      jest.mock('../../../../app/app-insights/app-insights.config', () => {
        const original = jest.requireActual('../../../../app/app-insights/app-insights.config')
        return {
          ...original,
          connectionString: MOCK_CONNECTION_STRING,
          roleName: 'mock_app_name'
        }
      })
      const appInsightsConfig = require('../../../../app/app-insights/app-insights.config')
      const cloudRoleTag = appInsights.defaultClient.context.keys.cloudRole

      const { setup } = require('../../../../app/app-insights/app-insights')
      setup()

      expect(MOCK_APP_INSIGHTS_SETUP).toHaveBeenCalledWith(MOCK_CONNECTION_STRING)
      expect(logSpy).toHaveBeenCalledWith('App Insights Running')
      expect(appInsights.defaultClient.context.tags[cloudRoleTag]).toEqual(appInsightsConfig.roleName)
    })

    test('when there is no app insights config defined', () => {
      jest.mock('../../../../app/app-insights/app-insights.config', () => {
        const original = jest.requireActual('../../../../app/app-insights/app-insights.config')
        return {
          ...original,
          connectionString: undefined,
          roleName: undefined
        }
      })

      const { setup } = require('../../../../app/app-insights/app-insights')
      setup()

      expect(MOCK_APP_INSIGHTS_SETUP).toHaveBeenCalledTimes(0)
      expect(logSpy).toHaveBeenCalledWith('App Insights Not Running!')
    })
  })

  describe('logException', () => {
    test('when called with empty request and empty event', () => {
      const { logException } = require('../../../../app/app-insights/app-insights')

      logException({}, {})

      expect(appInsights.defaultClient.trackException).toHaveBeenCalledWith({
        exception: new Error('unknown'),
        properties: {
          statusCode: undefined,
          sessionId: undefined,
          payload: undefined,
          request: 'Server Error'
        }
      })
    })

    test('when called with both request and event', () => {
      const req = {
        statusCode: 200,
        yar: { id: 'mock_id' },
        payload: 'mock_payload'
      }
      const event = {
        error: 'mock_error',
        request: 'mock_request'
      }

      const { logException } = require('../../../../app/app-insights/app-insights')
      logException(req, event)

      expect(appInsights.defaultClient.trackException).toHaveBeenCalledWith({
        exception: event.error,
        properties: {
          statusCode: req.statusCode,
          sessionId: req.yar.id,
          payload: req.payload,
          request: event.request
        }
      })
    })
  })
})
