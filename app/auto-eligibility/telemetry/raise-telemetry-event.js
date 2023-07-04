const { PublishEvent } = require('ffc-ahwr-event-publisher')
const config = require('../../config')
const appInsightsConfig = require('../../app-insights/app-insights.config')

module.exports = (customer) => {
  const eventPublisher = new PublishEvent(config.mqConfig.eventQueue)
  return async (type, message, data) => {
    const event = {
      name: 'register-your-interest-event',
      properties: {
        id: customer.businessEmail,
        sbi: 'n/a',
        cph: 'n/a',
        checkpoint: appInsightsConfig.appInsightsCloudRole,
        status: 'success',
        action: {
          type,
          message,
          data,
          raisedBy: customer.businessEmail
        }
      }
    }
    await eventPublisher.sendEvent(event)
  }
}
