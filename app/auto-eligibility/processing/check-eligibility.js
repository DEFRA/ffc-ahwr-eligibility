const eligibilityDbTable = require('../db/eligibility.db.table')

const checkEligibility = async (sbi, crn, businessEmail) => {
  console.log(`Checking eligibility: ${JSON.stringify({ sbi, crn, businessEmail })}`)
  const businesses = await eligibilityDbTable.findAllByBusinessEmail(businessEmail)
  const eligibleBussiness = businesses.find(business => business.sbi === sbi && business.crn === crn)
  return {
    sbi,
    crn,
    businessEmail,
    isEligible: () => typeof eligibleBussiness !== 'undefined',
    hasMultipleSbiNumbersAttachedToBusinessEmail: () => businesses.length > 1,
    isAlreadyOnWaitingList: () => typeof eligibleBussiness !== 'undefined' && typeof eligibleBussiness.waiting_updated_at !== 'undefined',
    hasAccessGranted: () => typeof eligibleBussiness !== 'undefined' && eligibleBussiness.access_granted,
  }
}

module.exports = checkEligibility
