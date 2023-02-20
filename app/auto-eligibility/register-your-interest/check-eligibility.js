const customerDbTable = require('../db/customer.db.table')

const checkEligibility = async (sbi, crn, businessEmail) => {
  console.log(`${new Date().toISOString()} Checking eligibility: ${JSON.stringify({ sbi, crn, businessEmail })}`)
  const customers = await customerDbTable.findAllBySbiOrBusinessEmail(sbi, businessEmail)
  const sbiAlreadyRegistered = customers
    .filter(customer => customer.sbi.toString() === sbi.toString())
    .some(customer => customer.waiting_updated_at != null)
  if (sbiAlreadyRegistered) {
    console.log(`${new Date().toISOString()} SBI already registered: ${JSON.stringify({ sbi })}`)
    return {
      sbi,
      crn,
      businessEmail,
      sbiAlreadyRegistered: true,
      isRegisteringForEligibleSbi: false,
      businessEmailHasMultipleDistinctSbi: false
    }
  }
  const eligibleSbi = customers
    .filter(customer => customer.business_email === businessEmail)
    .find(customer => customer.sbi.toString() === sbi.toString() && customer.crn === crn)
  console.log(typeof eligibleSbi !== 'undefined'
    ? `${new Date().toISOString()} Eligible SBI found: ${JSON.stringify({ ...eligibleSbi })}`
    : `${new Date().toISOString()} Eligible SBI not found`
  )
  return {
    sbi,
    crn,
    businessEmail,
    sbiAlreadyRegistered: false,
    isRegisteringForEligibleSbi: typeof eligibleSbi !== 'undefined',
    businessEmailHasMultipleDistinctSbi: [
      ...new Set(customers.map(customer => customer.sbi))
    ].length > 1
  }
}

module.exports = checkEligibility
