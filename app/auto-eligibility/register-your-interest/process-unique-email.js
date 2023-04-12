const emailNotifier = require('../email-notifier')
const waitingListTable = require('../db/waiting-list.db.table')
const raiseTelemetryEvent = require('../telemetry/raise-telemetry-event')
const telemetryEvent = require('../telemetry/telemetry-event')

const processUniqueEmail = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Processing unique business email: ${JSON.stringify({
    businessEmail
  })}`)
  await waitingListTable.registerInterest(businessEmail)
  await emailNotifier.sendWaitingListEmail(businessEmail)
  await raiseTelemetryEvent(businessEmail)( // TODO: make this raise a proper telemetry event
    telemetryEvent.REGISTRATION_OF_INTEREST,
    'The customer has been put on the waiting list',
    {
      sbi: 'n/a',
      crn: 'n/a',
      businessEmail,
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

module.exports = processUniqueEmail
