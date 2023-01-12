const emailNotifier = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')

const processEligibleCustomer = async (customer) => {
  console.log(`Processing eligible customer: ${JSON.stringify({
     ...customer
  })}`)
  if (customer.sbiAlreadyRegistered()) {
    console.log('The customer`s sbi has already been registered')
    return await emailNotifier.sendIneligibleApplicationEmail(
      customer.sbi,
      customer.crn,
      customer.businessEmail
    )
  }
  if (customer.businessEmailHasMultipleDistinctSbi()) {
    console.log('The customer`s business email has multiple sbi which as of now the system does not support')
    return await emailNotifier.sendIneligibleApplicationEmail(
      customer.sbi,
      customer.crn,
      customer.businessEmail
    )
  }
  if (customer.alreadyOnWaitingList()) {
    console.log('The customer is already on the waiting list')
    return
  }
  await customerDbTable.updateWaitingUpdatedAt(customer.sbi, customer.crn)
  await emailNotifier.sendWaitingListEmail(customer.businessEmail)
}

module.exports = processEligibleCustomer
