const appInsights = require('applicationinsights')
const config = require('./app-insights.config')

function setup () {
  if (config.connectionString) {
    appInsights.setup(
      config.connectionString
    ).start()
    console.log('App Insights Running')
    appInsights.defaultClient.context.tags[
      appInsights.defaultClient.context.keys.cloudRole
    ] = config.roleName
  } else {
    console.log('App Insights Not Running!')
  }
}

function logTrace (message, properties) {
  const telemetryClient = appInsights.defaultClient
  const traceTelemetry = {
    message,
    properties
  }
  telemetryClient?.trackTrace(traceTelemetry)
}

function logEvent (eventName, properties) {
  const telemetryClient = appInsights.defaultClient
  const eventTelemetry = {
    name: eventName,
    properties
  }
  telemetryClient?.trackEvent(eventTelemetry)
}

function logError (error, properties) {
  const telemetryClient = appInsights.defaultClient
  const exceptionTelemetry = {
    exception: error,
    properties
  }
  telemetryClient?.trackException(exceptionTelemetry)
}

module.exports = {
  setup,
  logTrace,
  logEvent,
  logError
}
