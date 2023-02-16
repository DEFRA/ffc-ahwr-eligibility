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
    telemetryEvent.RECOGNISED_AS_INELIGIBLE,
    'The customer has been recognised as ineligible',
    {
      customer: {
        sbi: customer.sbi,
        crn: customer.crn,
        businessEmail: customer.businessEmail
      },
      reasonForIneligibility: customer.sbiAlreadyRegistered
        ? 'Duplicate submission'
        : 'No match against data warehouse'
    }
  )
}

module.exports = processIneligibleSbi
