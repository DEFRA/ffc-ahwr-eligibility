const { sendApplyGuidanceEmail } = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')
const raiseTelemetryEvent = require('../telemetry/raise-telemetry-event')
const telemetryEvent = require('../telemetry/telemetry-event')

const processWaitingList = async (upperLimit) => {
  console.log(`${new Date().toISOString()} auto-eligibility:waiting-list Processing waiting list: ${JSON.stringify({ upperLimit })}`)
  const customers = await customerDbTable.updateAccessGranted(upperLimit)
  console.log(`${new Date().toISOString()} auto-eligibility:waiting-list [${customers.length}] new customer${customers.length !== 1 ? 's' : ''} are now eligible to apply for a review`)
  for (const customer of customers) {
    await sendApplyGuidanceEmail(customer.businessEmail)
    await raiseTelemetryEvent(customer)(
      telemetryEvent.GAINED_ACCESS_TO_THE_APPLY_JOURNEY,
      'The user has gained access to the apply journey',
      {
        crn: customer.crn,
        sbi: customer.sbi,
        businessEmail: customer.businessEmail,
        onWaitingList: false,
        waitingUpdatedAt: customer.waitingUpdatedAt,
        eligible: true,
        ineligibleReason: 'n/a',
        accessGranted: customer.accessGranted,
        accessGrantedAt: customer.lastUpdatedAt
      }
    )
  }
  return customers
}

module.exports = processWaitingList
