const { PublishEvent } = require('ffc-ahwr-event-publisher')
const config = require('../../config')
const appInsightsConfig = require('../../app-insights/app-insights.config')

module.exports = (customer) => {
  const eventPublisher = new PublishEvent(config.mqConfig.eventQueue)
  return async (type, message, data) => {
    await eventPublisher.sendEvent({
      name: 'send-session-event',
      properties: {
        id: `${customer.sbi}_${customer.crn}`,
        sbi: `${customer.sbi}`,
        cph: 'n/a',
        checkpoint: appInsightsConfig.appInsightsCloudRole,
        action: {
          type,
          message,
          data,
          raisedOn: new Date(),
          raisedBy: customer.businessEmail
        }
      }
    })
  }
}
