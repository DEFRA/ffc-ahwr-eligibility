const { sendApplyGuidanceEmail } = require('../email-notifier')
const waitingListTable = require('../db/waiting-list.db.table')
const raiseTelemetryEvent = require('../telemetry/raise-telemetry-event')
const telemetryEvent = require('../telemetry/telemetry-event')

const processWaitingList = async (upperLimit) => {
  console.log(`${new Date().toISOString()} auto-eligibility:waiting-list Processing waiting list: ${JSON.stringify({ upperLimit })}`)
  const customers = await waitingListTable.updateAccessGranted(upperLimit)
  console.log(`${new Date().toISOString()} auto-eligibility:waiting-list [${customers.length}] new customer${customers.length !== 1 ? 's' : ''} are now eligible to apply for a review`)
  for (const customer of customers) {
    await sendApplyGuidanceEmail(customer.businessEmail)
    await raiseTelemetryEvent(customer)(
      telemetryEvent.GAINED_ACCESS_TO_THE_APPLY_JOURNEY,
      'The user has gained access to the apply journey',
      {
        businessEmail: customer.businessEmail,
        createdAt: customer.createdAt,
        accessGranted: customer.accessGranted,
        accessGrantedAt: customer.accessGrantedAt
      }
    )
  }
}

module.exports = processWaitingList
