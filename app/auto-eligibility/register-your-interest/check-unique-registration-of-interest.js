const waitingListTable = require('../db/waiting-list.db.table')
const raiseTelemetryEvent = require('../telemetry/raise-telemetry-event')
const telemetryEvent = require('../telemetry/telemetry-event')

const checkUniqueRegistrationOfInterest = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Checking unique registration: ${JSON.stringify({ businessEmail })}`)
  const customers = await waitingListTable.findAllByBusinessEmail(businessEmail)
  if (customers.length === 0) {
    console.log(`${new Date().toISOString()} Email is unique: ${JSON.stringify({ businessEmail })}`)
    return true
  } else {
    console.log(`${new Date().toISOString()} Email already registered: ${JSON.stringify({ customers })}`)
    await raiseTelemetryEvent({
      businessEmail
    })(
      telemetryEvent.DUPLICATE_SUBMISSION,
      'The email address has already been submitted',
      {
        businessEmail,
        createdAt: new Date(),
        accessGranted: customers[0].access_granted,
        accessGrantedAt: customers[0].access_granted ? customers[0].access_granted_at : 'n/a'
      }
    )
    return false
  }
}

module.exports = checkUniqueRegistrationOfInterest
