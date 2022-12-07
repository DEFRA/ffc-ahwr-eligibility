const { MessageReceiver } = require('ffc-messaging')
const config = require('../config')
const processRegisterYourInterestMessage = require('./process-message')

let registerYourInterestReceiver

const start = async () => {
  const registerYourInterestMessageHandler = message => processRegisterYourInterestMessage(message, registerYourInterestReceiver)
  registerYourInterestReceiver = new MessageReceiver(config.registerYourInterestRequestQueue, registerYourInterestMessageHandler)
  await registerYourInterestReceiver.subscribe()

  console.info('Ready to receive messages')
}

const stop = async () => {
  await registerYourInterestReceiver.closeConnection()
}

module.exports = { start, stop }
