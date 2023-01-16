const appInsights = require('applicationinsights')

function setup () {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    appInsights.setup().start()
    console.log(`${new Date().toISOString()} App Insights Running...`)
    const cloudRoleTag = appInsights.defaultClient.context.keys.cloudRole
    const appName = process.env.APPINSIGHTS_CLOUDROLE
    appInsights.defaultClient.context.tags[cloudRoleTag] = appName
  } else {
    console.log(`${new Date().toISOString()} App Insights Not Running!`)
  }
}

module.exports = { setup }
