const schema = require('./register-your-interest-request.schema')
const autoEligibility = require('../../auto-eligibility/processing')

const processRegisterYourInterestRequest = async (request) => {
  console.log(`Processing register your interest request: ${JSON.stringify(request)}`)
  const req = schema.validate(request)
  if (req.error) {
    throw new Error(req.error)
  }
  const { sbi, crn, email: businessEmail } = req.value
  const customer = await autoEligibility.checkEligibility(sbi, crn, businessEmail)
  if (customer.isEligible()) {
    await autoEligibility.processEligibleCustomer(customer)
  } else {
    await autoEligibility.processIneligibleCustomer(customer)
  }
}

module.exports = processRegisterYourInterestRequest
