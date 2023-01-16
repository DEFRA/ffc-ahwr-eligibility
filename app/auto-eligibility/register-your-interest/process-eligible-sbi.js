const emailNotifier = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')

const processEligibleSbi = async (customer) => {
  console.log(`Processing eligible SBI: ${JSON.stringify({
     ...customer
  })}`)
  if (customer.businessEmailHasMultipleDistinctSbi()) {
    console.log('The customer`s business email has multiple SBI which as of now the system does not support')
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
