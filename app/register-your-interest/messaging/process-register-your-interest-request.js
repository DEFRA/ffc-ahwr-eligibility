const { checkEligibility, processEligible, processIneligible } = require('../../auto-eligibility/processing')
const schema = require('./register-your-interest-request.schema')

const processRegisterYourInterestRequest = async (request) => {
  console.log(`Processing register your interest request: ${JSON.stringify(request)}`)
  const req = schema.validate(request)
  if (req.error) {
    throw new Error(req.error)
  }
  const { sbi, crn, email } = req.value
  const eligible = await checkEligibility(sbi, crn)
  if (eligible) {
    await processEligible(sbi, crn, email)
  } else {
    await processIneligible(sbi, crn, email)
  }
}

module.exports = processRegisterYourInterestRequest
