const schema = require('./register-your-interest.schema')
const checkEligibility = require('./check-eligibility')
const processEligibleCustomer = require('./process-eligible-customer')
const processIneligibleCustomer = require('./process-ineligible-customer')

const processRegisterYourInterest = async (request) => {
  console.log(`Processing register your interest: ${JSON.stringify(request)}`)
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

module.exports = processRegisterYourInterest
