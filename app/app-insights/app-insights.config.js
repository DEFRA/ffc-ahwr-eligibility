const schema = require('./app-insights.config.schema')

const config = {
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  roleName: process.env.APPINSIGHTS_CLOUDROLE
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  console.log(error)
  throw new Error(`The app insights configuration is invalid. ${error.message}`)
}

module.exports = { ...value }
