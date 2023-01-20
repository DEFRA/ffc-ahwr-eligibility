const appInsights = require('applicationinsights')
const config = require('./app-insights.config')

function setup () {
  console.log(`${new Date().toISOString()} app-insights:setup`)
  if (config.applicationInsightsConnectionString && config.appInsightsCloudRole) {
    appInsights
      .setup(config.applicationInsightsConnectionString)
      .start()
    console.log(`${new Date().toISOString()} app-insights:running...`)
    appInsights.defaultClient.context.tags[
      appInsights.defaultClient.context.keys.cloudRole
    ] = config.appInsightsCloudRole
  } else {
    console.log(`${new Date().toISOString()} app-insights:not running!`)
  }
}

module.exports = setup
