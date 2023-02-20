const emailNotifier = require('../email-notifier')
const raiseTelemetryEvent = require('../telemetry/raise-telemetry-event')
const telemetryEvent = require('../telemetry/telemetry-event')

const processIneligibleSbi = async (customer) => {
  console.log(`${new Date().toISOString()} Processing ineligible SBI: ${JSON.stringify({
    ...customer
  })}`)
  await emailNotifier.sendIneligibleApplicationEmail(
    customer.sbi,
    customer.crn,
    customer.businessEmail
  )
  await raiseTelemetryEvent(customer)(
    telemetryEvent.REGISTRATION_OF_INTEREST,
    'The customer has been recognised as ineligible',
    {
      crn: customer.crn,
      sbi: customer.sbi,
      businessEmail: customer.businessEmail,
      interestRegisteredAt: new Date(),
      onWaitingList: false,
      waitingUpdatedAt: 'n/a',
      eligible: false,
      ineligibleReason: customer.sbiAlreadyRegistered
        ? 'Duplicate submission'
        : 'No match against data warehouse',
      accessGranted: false,
      accessGrantedAt: 'n/a'
    }
  )
}

module.exports = processIneligibleSbi
