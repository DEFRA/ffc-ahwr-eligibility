const appInsights = require('applicationinsights')
const config = require('./app-insights.config')

function setup () {
  if (config.connectionString) {
    appInsights.setup(
      config.connectionString
    ).start()
    console.log('App Insights Running')
    const cloudRoleTag = appInsights.defaultClient.context.keys.cloudRole
    appInsights.defaultClient.context.tags[cloudRoleTag] = config.roleName
  } else {
    console.log('App Insights Not Running!')
  }
}

function logException (request, event) {
  try {
    const client = appInsights.defaultClient
    client?.trackException({
      exception: event.error ?? new Error('unknown'),
      properties: {
        statusCode: request ? request.statusCode : '',
        sessionId: request ? request.yar?.id : '',
        payload: request ? request.payload : '',
        request: event.request ?? 'Server Error'
      }
    })
  } catch (err) {
    console.error(err, 'App Insights')
  }
}

module.exports = { setup, logException }