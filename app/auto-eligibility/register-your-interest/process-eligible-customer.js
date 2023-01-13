const emailNotifier = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')

const processEligibleCustomer = async (customer) => {
  console.log(`Processing eligible customer: ${JSON.stringify({
     ...customer
  })}`)
  if (customer.businessEmailHasMultipleDistinctSbi()) {
    console.log('The customer`s business email has multiple sbi which as of now the system does not support')
    return await emailNotifier.sendIneligibleApplicationEmail(
      customer.sbi,
      customer.crn,
      customer.businessEmail
    )
  }
  await customerDbTable.updateWaitingUpdatedAt(customer.sbi, customer.crn)
  await emailNotifier.sendWaitingListEmail(customer.businessEmail)
}

module.exports = processEligibleCustomer
