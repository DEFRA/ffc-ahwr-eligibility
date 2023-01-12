const customerDbTable = require('../db/customer.db.table')

const checkEligibility = async (sbi, crn, businessEmail) => {
  console.log(`Checking eligibility: ${JSON.stringify({ sbi, crn, businessEmail })}`)
  const customers = await customerDbTable.findAllBySbiOrBusinessEmail(sbi, businessEmail)
  if (customers
    .filter(customer => customer.sbi === sbi)
    .some(customer => typeof customer.waiting_updated_at !== 'undefined')
  ) {
    console.log(`Sbi already registered: ${JSON.stringify({ sbi })}`)
    return {
      sbi,
      crn,
      businessEmail,
      sbiAlreadyRegistered: () => true,
      isEligible: () => false,
      businessEmailHasMultipleDistinctSbi: () => false,
      alreadyOnWaitingList: () => false,
      hasAccessGranted: () => false
    }
  }
  const eligibleCustomer = customers
    .filter(customer => customer.business_email === businessEmail)
    .find(customer => customer.sbi === sbi && customer.crn === crn)
  console.log(typeof eligibleCustomer !== 'undefined'
    ? `Eligible customer found: ${JSON.stringify({ ...eligibleCustomer })}`
    : 'Eligible customer not found'
  )
  return {
    sbi,
    crn,
    businessEmail,
    sbiAlreadyRegistered: () => false,
    isEligible: () => typeof eligibleCustomer !== 'undefined',
    businessEmailHasMultipleDistinctSbi: () => [
      ...new Set(customers.map(customer => customer.sbi))
    ].length > 1,
    alreadyOnWaitingList: () => typeof eligibleCustomer !== 'undefined' && typeof eligibleCustomer.waiting_updated_at !== 'undefined',
    hasAccessGranted: () => typeof eligibleCustomer !== 'undefined' && eligibleCustomer.access_granted
  }
}

module.exports = checkEligibility
