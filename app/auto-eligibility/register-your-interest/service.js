const { MessageReceiver } = require('ffc-messaging')
const registerYourInterestConfig = require('../../config').registerYourInterestConfig
const processRegisterYourInterestRequest = require('./process-register-your-interest')

let registerYourInterestReceiver

const start = async () => {
  try {
    const registerYourInterestMessageHandler = message => {
      processRegisterYourInterestRequest(message.body)
      registerYourInterestReceiver.completeMessage(message)
    }
    registerYourInterestReceiver = new MessageReceiver(registerYourInterestConfig.registerYourInterestRequestQueue, registerYourInterestMessageHandler)
    await registerYourInterestReceiver.subscribe()
    console.info('Ready to receive messages')
  } catch (e) {
    console.error('Error starting message receiver.', e)
  }
}

const stop = async () => {
  await registerYourInterestReceiver.closeConnection()
}

module.exports = { start, stop }
