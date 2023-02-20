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
      telemetryEvent.REGISTERED_THEIR_INTEREST,
      'The customer has been put on the waiting list',
      {
        sbi: customer.sbi,
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
  } else {
    if (customer.businessEmailHasMultipleDistinctSbi) {
      console.log(`${new Date().toISOString()} The customer's business email has multiple distinct SBI`)
      await raiseTelemetryEvent(customer)(
        telemetryEvent.REGISTERED_THEIR_INTEREST,
        'Rejected due to multiple SBI numbers',
        {
          sbi: customer.sbi,
          crn: customer.crn,
          businessEmail: customer.businessEmail,
          interestRegisteredAt: new Date(),
          eligible: false,
          ineligibleReason: 'multiple SBI numbers',
          onWaitingList: false,
          waitingUpdatedAt: 'n/a',
          accessGranted: false,
          accessGrantedAt: 'n/a'
        }
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
      telemetryEvent.REGISTERED_THEIR_INTEREST,
      'The customer has been put on the waiting list',
      {
        sbi: customer.sbi,
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
}

module.exports = processEligibleSbi
