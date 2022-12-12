const db = require('../data')

const checkEligibility = async (sbi, crn) => {
  return db.eligibility.findOne({
    where: {
      sbi,
      crn
    }
  })
}

module.exports = checkEligibility
