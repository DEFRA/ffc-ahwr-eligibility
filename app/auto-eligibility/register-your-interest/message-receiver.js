const { MessageReceiver } = require('ffc-messaging')
const registerYourInterestConfig = require('../../config').registerYourInterestConfig
const telemetryClient = require('../../app-insights/telemetry-client')
const processRegisterYourInterest = require('./process-register-your-interest')

let messageReceiver

const start = async () => {
  try {
    messageReceiver = new MessageReceiver(
      registerYourInterestConfig.registerYourInterestRequestQueue,
      message => {
        try {
          processRegisterYourInterest(message.body)
          messageReceiver.completeMessage(message)
          console.log(`${new Date().toISOString()} Register your interest message has been processed`)
        } catch (error) {
          messageReceiver.deadLetterMessage(message)
          console.error(`${new Date().toISOString()} Error while processing register your interest message`, error)
          telemetryClient.trackException({
            exception: error
          })
        }
      }
    )
    await messageReceiver.subscribe()
    console.info(`${new Date().toISOString()} Ready to receive "register your interest" messages...`)
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
