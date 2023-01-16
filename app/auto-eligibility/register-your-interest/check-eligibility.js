const customerDbTable = require('../db/customer.db.table')

const checkEligibility = async (sbi, crn, businessEmail) => {
  console.log(`Checking eligibility: ${JSON.stringify({ sbi, crn, businessEmail })}`)
  const customers = await customerDbTable.findAllBySbiOrBusinessEmail(sbi, businessEmail)
  if (customers
    .filter(customer => customer.sbi.toString() === sbi.toString())
    .some(customer => customer.waiting_updated_at != null)
  ) {
    console.log(`SBI already registered: ${JSON.stringify({ sbi })}`)
    return {
      sbi,
      crn,
      businessEmail,
      isRegisteringForEligibleSbi: () => false,
      businessEmailHasMultipleDistinctSbi: () => false
    }
  }
  const eligibleSbi = customers
    .filter(customer => customer.business_email === businessEmail)
    .find(customer => customer.sbi.toString() === sbi.toString() && customer.crn === crn)
  console.log(typeof eligibleSbi !== 'undefined'
    ? `Eligible SBI found: ${JSON.stringify({ ...eligibleSbi })}`
    : 'Eligible SBI not found'
  )
  return {
    sbi,
    crn,
    businessEmail,
    isRegisteringForEligibleSbi: () => typeof eligibleSbi !== 'undefined',
    businessEmailHasMultipleDistinctSbi: () => [
      ...new Set(customers.map(customer => customer.sbi))
    ].length > 1
  }
}

module.exports = checkEligibility
