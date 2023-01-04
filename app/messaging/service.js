const { MessageReceiver } = require('ffc-messaging')
const logger = require('../app-insights')
const registerYourInterestConfig = require('../config').registerYourInterestConfig
const processRegisterYourInterestRequest = require('../register-your-interest/messaging/process-register-your-interest-request')

let registerYourInterestReceiver

const start = async () => {
  try {
    const registerYourInterestMessageHandler = message => {
      processRegisterYourInterestRequest(message.body)
      registerYourInterestReceiver.completeMessage(message)
    }
    registerYourInterestReceiver = new MessageReceiver(registerYourInterestConfig.registerYourInterestRequestQueue, registerYourInterestMessageHandler)
    await registerYourInterestReceiver.subscribe()
    logger.logTrace('Ready to receive messages')
  } catch (e) {
    logger.logError(e, 'Failed to start the message receiver')
  }
}

const stop = async () => {
  await registerYourInterestReceiver.closeConnection()
}

module.exports = { start, stop }
