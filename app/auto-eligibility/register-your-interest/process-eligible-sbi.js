const emailNotifier = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')
const raiseTelemetryEvent = require('../telemetry/raise-telemetry-event')
const telemetryEvent = require('../telemetry/telemetry-event')

const processEligibleSbi = async (customer) => {
  console.log(`${new Date().toISOString()} Processing eligible SBI: ${JSON.stringify({
    customer
  })}`)
  await customerDbTable.updateWaitingUpdatedAt(customer.sbi, customer.crn)
  await emailNotifier.sendWaitingListEmail(customer.businessEmail)
  await raiseTelemetryEvent(customer)(
    telemetryEvent.REGISTRATION_OF_INTEREST,
    'The customer has been put on the waiting list',
    {
      sbi: `${customer.sbi}`,
      crn: customer.crn,
      businessEmail: customer.businessEmail,
      interestRegisteredAt: new Date(),
      eligible: true,
      ineligibleReason: 'n/a',
      onWaitingList: true,
      waitingUpdatedAt: new Date(),
      accessGranted: false,
      accessGrantedAt: 'n/a'
    }
  )
}

module.exports = processEligibleSbi
