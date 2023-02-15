const { sendApplyGuidanceEmail } = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')
const raiseEvent = require('../../event/raise-event')
const appInsightsConfig = require('../../app-insights/app-insights.config')

const processWaitingList = async (upperLimit) => {
  console.log(`${new Date().toISOString()} auto-eligibility:waiting-list processing waiting list: ${JSON.stringify({ upperLimit })}`)
  const result = await customerDbTable.updateAccessGranted(upperLimit)
  const customers = result[0]
  console.log(`${new Date().toISOString()} auto-eligibility:waiting-list [${customers.length}] new customer${customers.length !== 1 ? 's' : ''} are now eligible to apply for a review`)
  for (const customer of customers) {
    await sendApplyGuidanceEmail(customer.business_email)
    await raiseEvent({
      name: 'auto-eligibility:waiting-list:event',
      properties: {
        id: `${customer.sbi}_${customer.crn}`,
        sbi: customer.sbi,
        cph: 'n/a',
        checkpoint: appInsightsConfig.appInsightsCloudRole,
        status: 'SUCCESS',
        action: {
          type: 'eligible_to_apply_for_a_review.',
          message: 'The customer is now eligible to apply for a review',
          data: {
            customer
          },
          raisedOn: new Date(),
          raisedBy: 'auto-eligibility:waiting-list'
        }
      }
    })
  }
  return customers
}

module.exports = processWaitingList
