const raiseEvent = require('../../event/raise-event')
const appInsightsConfig = require('../../app-insights/app-insights.config')

module.exports = (customer) => {
  return async (type, message, data = customer) => {
    await raiseEvent({
      name: 'send-session-event',
      properties: {
        id: `${customer.sbi}_${customer.crn}`,
        sbi: customer.sbi,
        cph: 'n/a',
        checkpoint: appInsightsConfig.appInsightsCloudRole,
        action: {
          type: type,
          message,
          data,
          raisedOn: new Date(),
          raisedBy: customer.businessEmail
        }
      }
    })
  }
}
