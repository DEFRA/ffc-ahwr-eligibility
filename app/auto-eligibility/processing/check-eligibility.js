const logger = require('../../logger')
const db = require('../../data')

const checkEligibility = async (sbi, crn, email) => {
  logger.logTrace('Checking eligibility', {
    sbi,
    crn,
    email
  })
  return db.eligibility.findOne({
    where: {
      sbi,
      crn,
      business_email: email
    }
  })
}

module.exports = checkEligibility
