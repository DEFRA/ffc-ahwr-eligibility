const messageQueueConfig = require('./message-queue')

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The server config is invalid. ${error.message}`)
}

module.exports = { ...value, ...messageQueueConfig }
