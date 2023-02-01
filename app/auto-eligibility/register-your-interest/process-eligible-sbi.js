const emailNotifier = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')
const config = require('../config/index.js')

const processEligibleSbi = async (customer) => {
  console.log(`${new Date().toISOString()} Processing eligible SBI: ${JSON.stringify({
     ...customer
  })}`)
  if (customer.businessEmailHasMultipleDistinctSbi() && config.checkEmailLinkedToMultipleSbiEnabled === true) {
    console.log(`${new Date().toISOString()} The customer's business email has multiple distinct SBI`)
    return await emailNotifier.sendIneligibleApplicationEmail(
      customer.sbi,
      customer.crn,
      customer.businessEmail
    )
  }
  await customerDbTable.updateWaitingUpdatedAt(customer.sbi, customer.crn)
  await emailNotifier.sendWaitingListEmail(customer.businessEmail)
}

module.exports = processEligibleSbi
