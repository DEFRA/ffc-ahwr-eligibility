const Joi = require('joi')
const msgTypePrefix = 'uk.gov.ffc.ahwr'

const sharedConfigSchema = {
  appInsights: Joi.object(),
  host: Joi.string().default('localhost'),
  password: Joi.string(),
  username: Joi.string(),
  useCredentialChain: Joi.bool().default(false)
}

const schema = Joi.object({
  registerYourInterestRequestQueue: {
    address: Joi.string().default('registerYourInterestRequestQueue'),
    type: Joi.string(),
    msgType: Joi.string().default(`${msgTypePrefix}.register.your.interest.request`),
    ...sharedConfigSchema
  }
})

const sharedConfig = {
  appInsights: require('applicationinsights'),
  host: process.env.MESSAGE_QUEUE_HOST,
  password: process.env.MESSAGE_QUEUE_PASSWORD,
  username: process.env.MESSAGE_QUEUE_USER,
  useCredentialChain: process.env.NODE_ENV === 'production'
}

const config = {
  registerYourInterestRequestQueue: {
    address: process.env.REGISTER_YOUR_INTEREST_REQUEST_QUEUE_ADDRESS,
    type: 'queue',
    ...sharedConfig
  }
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  console.log(error)
  throw new Error(`The message queue config is invalid. ${error.message}`)
}

module.exports = value