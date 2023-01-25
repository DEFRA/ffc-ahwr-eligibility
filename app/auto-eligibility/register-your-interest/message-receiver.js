const { MessageReceiver } = require('ffc-messaging')
const registerYourInterestConfig = require('../../config').registerYourInterestConfig
const processRegisterYourInterest = require('./process-register-your-interest')

let messageReceiver

const start = async () => {
  try {
    messageReceiver = new MessageReceiver(
      registerYourInterestConfig.registerYourInterestRequestQueue,
      async (message) => {
        try {
          await processRegisterYourInterest(message.body)
          await messageReceiver.completeMessage(message)
          console.log(`${new Date().toISOString()} Register your interest message has been processed`)
        } catch (error) {
          await messageReceiver.deadLetterMessage(message)
          console.error(`${new Date().toISOString()} Error while processing register your interest message`, error)
          telemetryClient.trackException({
            exception: error
          })
        }
      }
    )
    await messageReceiver.subscribe()
    console.log(`${new Date().toISOString()} Ready to receive "register your interest" messages...`)
  } catch (error) {
    console.error(`${new Date().toISOString()} Error starting message receiver`, error)
    telemetryClient.trackException({
      exception: error
    })
  }
}

const stop = async () => {
  await messageReceiver.closeConnection()
}

module.exports = { start, stop }
