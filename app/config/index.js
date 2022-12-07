const Joi = require('joi')
const messageQueueConfig = require('./message-queue')
const msgTypePrefix = 'uk.gov.ffc.ahwr'

const schema = Joi.object({
  registerYourInterest: {
    requestMsgType: Joi.string()
  }
})

const config = {
  registerYourInterest: {
    requestMsgType: `${msgTypePrefix}.register.your.interest.request`
  }
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

module.exports = { ...value, ...messageQueueConfig }
