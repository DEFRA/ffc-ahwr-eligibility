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
          trackTrace: jest.fn((item) => null),
          trackEvent: jest.fn((item) => null),
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

      const { setup } = require('../../../../app/app-insights')
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

      const { setup } = require('../../../../app/app-insights')
      setup()

      expect(MOCK_APP_INSIGHTS_SETUP).toHaveBeenCalledTimes(0)
      expect(logSpy).toHaveBeenCalledWith('App Insights Not Running!')
    })
  })

  describe('logTrace', () => {
    test('when called with message and some custom properties', () => {
      const { logTrace } = require('../../../../app/app-insights')

      logTrace('Trace message', {
        param1: 'value1',
        param2: 'value2'
      })

      /*
      expect(appInsights.defaultClient.trackTrace).toHaveBeenCalledWith({
        message: 'Trace message',
        properties: {
          param1: 'value1',
          param2: 'value2'
        }
      })
      */
    })
  })

  describe('logEvent', () => {
    test('when called with message and some custom properties', () => {
      const { logEvent } = require('../../../../app/app-insights')

      logEvent('Event name', {
        param1: 'value1',
        param2: 'value2'
      })

      /*
      expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith({
        name: 'Event name',
        properties: {
          param1: 'value1',
          param2: 'value2'
        }
      })
      */
    })
  })

  describe('logError', () => {
    test('when called with message and some custom properties', () => {
      const { logError } = require('../../../../app/app-insights')

      logError(new Error('msg'), 'Error message', {
        param1: 'value1',
        param2: 'value2'
      })

      expect(appInsights.defaultClient.trackException).toHaveBeenCalledWith({
        exception: new Error('msg'),
        properties: {
          errorMessage: 'Error message',
          param1: 'value1',
          param2: 'value2'
        }
      })
    })
  })
})
