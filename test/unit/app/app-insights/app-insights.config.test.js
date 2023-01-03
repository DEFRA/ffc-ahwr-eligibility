describe('App Insights Config', () => {
  const OLD_ENV = process.env

  let appInsightsConfig

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  test('None of the fields are populated', async () => {
    appInsightsConfig = require('../../../../app/app-insights/app-insights.config')
    expect(appInsightsConfig).toBeDefined()
  })

  test('All of the fields are populated', async () => {
    const CONN_STRING = 'conn_string'
    const ROLE_NAME = 'role_name'

    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = CONN_STRING
    process.env.APPINSIGHTS_CLOUDROLE = ROLE_NAME
    appInsightsConfig = require('../../../../app/app-insights/app-insights.config')

    expect(appInsightsConfig).toBeDefined()
    expect(appInsightsConfig.connectionString).toEqual(CONN_STRING)
    expect(appInsightsConfig.roleName).toEqual(ROLE_NAME)
  })

  test('All of the fields are empty', async () => {
    const CONN_STRING = ''
    const ROLE_NAME = ''

    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = CONN_STRING
    process.env.APPINSIGHTS_CLOUDROLE = ROLE_NAME
    appInsightsConfig = require('../../../../app/app-insights/app-insights.config')

    expect(appInsightsConfig).toBeDefined()
    expect(appInsightsConfig.connectionString).toEqual(CONN_STRING)
    expect(appInsightsConfig.roleName).toEqual(ROLE_NAME)
  })

  test('Schema validation error', () => {
    const CONN_STRING = 123
    const ROLE_NAME = 'role_name'

    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = CONN_STRING
    process.env.APPINSIGHTS_CLOUDROLE = ROLE_NAME

    expect(
      () => require('../../../../app/app-insights/app-insights.config')
    ).toThrowError('The app insights configuration is invalid. "connectionString" must be a string')
  })
})
