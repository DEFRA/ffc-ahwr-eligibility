const { MessageReceiver } = require('ffc-messaging')
const registerYourInterestConfig = require('../config').registerYourInterestConfig
const processRegisterYourInterestMessage = require('../register-your-interest/messaging/process-message')

let registerYourInterestReceiver

const start = async () => {
  try {
    const registerYourInterestMessageHandler = message => {
      processRegisterYourInterestMessage(message)
      registerYourInterestReceiver.completeMessage(message)
    }

    registerYourInterestReceiver = new MessageReceiver(registerYourInterestConfig.registerYourInterestRequestQueue, registerYourInterestMessageHandler)
    await registerYourInterestReceiver.subscribe()
    console.info('Ready to receive messages')
  } catch (ex) {
    console.log(ex, 'exception in message start')
  }
}

const stop = async () => {
  await registerYourInterestReceiver.closeConnection()
}

module.exports = { start, stop }
