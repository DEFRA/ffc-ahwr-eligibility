const emailNotifier = require('../email-notifier')
const raiseEvent = require('../../event/raise-event')
const appInsightsConfig = require('../../app-insights/app-insights.config')

const processIneligibleSbi = async (customer) => {
  console.log(`${new Date().toISOString()} Processing ineligible SBI: ${JSON.stringify({
    ...customer
  })}`)
  await emailNotifier.sendIneligibleApplicationEmail(
    customer.sbi,
    customer.crn,
    customer.businessEmail
  )
  await raiseEvent({
    name: 'auto-eligibility:incoming-register-your-interest:recognised_as_ineligible',
    properties: {
      id: `${customer.sbi}_${customer.crn}`,
      sbi: customer.sbi,
      cph: 'n/a',
      checkpoint: appInsightsConfig.appInsightsCloudRole,
      status: 'SUCCESS',
      action: {
        type: 'recognised_as_ineligible',
        message: 'The customer has been recognised as ineligible',
        data: {
          customer: {
            sbi: customer.sbi,
            crn: customer.crn,
            businessEmail: customer.businessEmail
          },
          reasonForIneligible: customer.sbiAlreadyRegistered
            ? 'Duplicate submission'
            : 'No match against data warehouse'
        },
        raisedOn: new Date(),
        raisedBy: 'auto-eligibility:incoming-register-your-interest'
      }
    }
  })
}

module.exports = processIneligibleSbi
