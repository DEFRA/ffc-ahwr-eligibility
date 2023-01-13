const schema = require('./register-your-interest-request.schema')
const checkEligibility = require('./check-eligibility')
const processEligibleCustomer = require('./process-eligible-customer')
const processIneligibleCustomer = require('./process-ineligible-customer')

const processRegisterYourInterestRequest = async (request) => {
  console.log(`Processing register your interest request: ${JSON.stringify(request)}`)
  const req = schema.validate(request)
  if (req.error) {
    throw new Error(req.error)
  }
  const { sbi, crn, email: businessEmail } = req.value
  const customer = await checkEligibility(sbi, crn, businessEmail)
  if (customer.isEligible()) {
    await processEligibleCustomer(customer)
  } else {
    await processIneligibleCustomer(customer)
  }
}

module.exports = processRegisterYourInterestRequest
