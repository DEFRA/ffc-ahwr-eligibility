const emailNotifier = require('../email-notifier')
const raiseTelemetryEvent = require('../telemetry/raise-telemetry-event')
const telemetryEvent = require('../telemetry/telemetry-event')

const processDuplicateEmail = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Processing duplicate business email: ${JSON.stringify({
    businessEmail
  })}`)
  await emailNotifier.sendIneligibleDefraIdRegistrationEmail(businessEmail)
  await raiseTelemetryEvent(businessEmail)( // TODO: make this raise a proper telemetry event
    telemetryEvent.DUPLICATE_SUBMISSION,
    'The customer has been recognised as ineligible',
    {
      sbi: 'n/a',
      crn: 'n/a',
      businessEmail,
      interestRegisteredAt: new Date(),
      onWaitingList: false,
      waitingUpdatedAt: 'n/a',
      eligible: false,
      ineligibleReason: 'Duplicate submission',
      accessGranted: false,
      accessGrantedAt: 'n/a'
    }
  )
}

module.exports = processDuplicateEmail
