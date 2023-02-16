const emailNotifier = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')
const { selectYourBusiness } = require('../config/index.js')
const raiseTelemetryEvent = require('../telemetry/raise-telemetry-event')
const telemetryEvent = require('../telemetry/telemetry-event')

const processEligibleSbi = async (customer) => {
  console.log(`${new Date().toISOString()} Processing eligible SBI: ${JSON.stringify({
     customer,
     selectYourBusinessEnabled: selectYourBusiness.enabled
  })}`)
  if (selectYourBusiness.enabled) {
    await customerDbTable.updateWaitingUpdatedAt(customer.sbi, customer.crn)
    await emailNotifier.sendWaitingListEmail(customer.businessEmail)
    await raiseTelemetryEvent(customer)(
      telemetryEvent.PUT_ON_THE_WAITING_LIT,
      'The customer has been put on the waiting list'
    )
  } else {
    if (customer.businessEmailHasMultipleDistinctSbi) {
      console.log(`${new Date().toISOString()} The customer's business email has multiple distinct SBI`)
      await raiseTelemetryEvent(customer)(
        telemetryEvent.REJECTED_DUE_TO_MULTIPLE_SBI,
        'Rejected due to multiple SBI numbers'
      )
      return await emailNotifier.sendIneligibleApplicationEmail(
        customer.sbi,
        customer.crn,
        customer.businessEmail
      )
    }
    await customerDbTable.updateWaitingUpdatedAt(customer.sbi, customer.crn)
    await emailNotifier.sendWaitingListEmail(customer.businessEmail)
    await raiseTelemetryEvent(customer)(
      telemetryEvent.PUT_ON_THE_WAITING_LIT,
      'The customer has been put on the waiting list'
    )
  }
}

module.exports = processEligibleSbi
