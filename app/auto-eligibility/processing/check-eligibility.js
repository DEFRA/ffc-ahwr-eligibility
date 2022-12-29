const db = require('../../data')

const checkEligibility = async (sbi, crn, email) => {
  console.log(`Checking eligibility: ${JSON.stringify({ sbi, crn, email })}`)
  return db.eligibility.findOne({
    where: {
      sbi,
      crn,
      business_email: email
    }
  })
}

module.exports = checkEligibility
