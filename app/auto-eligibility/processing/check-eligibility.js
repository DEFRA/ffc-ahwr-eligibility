const eligibilityDbTable = require('../db/eligibility.db.table')

const checkEligibility = async (sbi, crn, businessEmail) => {
  const businesses = await eligibilityDbTable.findAllBy(sbi, crn, businessEmail)
  return {
    sbi,
    crn,
    businessEmail,
    isEligible: () => businesses.length > 0,
    hasMultipleSbiNumbersAttachedToTheBusinessEmail: () => businesses.length > 1,
    isAlreadyOnWaitingList: () => typeof businesses[0].waiting_updated_at !== 'undefined',
    hasAccessGranted: () => businesses[0].access_granted,
  }
}

module.exports = checkEligibility
