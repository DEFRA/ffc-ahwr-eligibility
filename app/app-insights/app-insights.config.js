const schema = require('./app-insights.config.schema')

const { error, value } = schema.validate(
  {
    applicationInsightsConnectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    appInsightsCloudRole: process.env.APPINSIGHTS_CLOUDROLE
  },
  {
    abortEarly: false
  }
)

if (error) {
  console.error(`${new Date().toISOString()} app-insights:config: ${error.message}`)
  throw error
}

module.exports = { ...value }
