const schema = require('./register-your-interest-request.schema')
const autoEligibility = require('../../auto-eligibility/processing')

const processRegisterYourInterestRequest = async (request) => {
  console.log(`Processing register your interest request: ${JSON.stringify(request)}`)
  const req = schema.validate(request)
  if (req.error) {
    throw new Error(req.error)
  }
  const { sbi, crn, email: businessEmail } = req.value
  const business = await autoEligibility.checkEligibility(sbi, crn, businessEmail)
  if (business.isEligible()) {
    if (business.hasMultipleSbiNumbersAttachedToBusinessEmail()) {
      await autoEligibility.processIneligible(business)
    } else {
      await autoEligibility.processEligible(business)
    }
  } else {
    await autoEligibility.processIneligible(business)
  }
}

module.exports = processRegisterYourInterestRequest
