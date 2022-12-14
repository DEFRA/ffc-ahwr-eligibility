const Joi = require('joi')
// const dbConfig = require('./database')
const registerYourInterestConfig = require('../register-your-interest/config')
const autoEligibilityConfig = require('../auto-eligibility/config')
const notifyConfig = require('./notify')

const schema = Joi.object({
  env: Joi.string().valid('development', 'test', 'production').default('development')
})

const config = {
  env: process.env.NODE_ENV
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

const value = result.value

value.isDev = value.env === 'development'
value.isTest = value.env === 'test'
value.isProd = value.env === 'production'

// value.dbConfig = dbConfig
value.registerYourInterestConfig = registerYourInterestConfig
value.autoEligibilityConfig = autoEligibilityConfig
value.notifyConfig = notifyConfig
module.exports = value
