const { MessageReceiver } = require('ffc-messaging')
const registerYourInterestConfig = require('../config').registerYourInterestConfig
const processRegisterYourInterestMessage = require('../register-your-interest/messaging/process-message')

let registerYourInterestReceiver

const start = async () => {
  const registerYourInterestMessageHandler = message => {
    processRegisterYourInterestMessage(message)
    registerYourInterestReceiver.completeMessage(message)
  }

  registerYourInterestReceiver = new MessageReceiver(registerYourInterestConfig.registerYourInterestRequestQueue, registerYourInterestMessageHandler)
  await registerYourInterestReceiver.subscribe()
  console.info('Ready to receive messages')
}

const stop = async () => {
  await registerYourInterestReceiver.closeConnection()
}

module.exports = { start, stop }
