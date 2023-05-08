const waitingListTable = require('../db/waiting-list.db.table')
const raiseTelemetryEvent = require('../telemetry/raise-telemetry-event')
const telemetryEvent = require('../telemetry/telemetry-event')

const processUniqueEmail = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Processing unique business email: ${JSON.stringify({
    businessEmail
  })}`)
  await waitingListTable.registerInterest(businessEmail)
  await raiseTelemetryEvent({
    businessEmail
  })(
    telemetryEvent.REGISTRATION_OF_INTEREST,
    'The customer has been put on the waiting list',
    {
      businessEmail: businessEmail,
      createdAt: new Date(),
      accessGranted: false,
      accessGrantedAt: 'n/a'
    }
  )
}

module.exports = processUniqueEmail
