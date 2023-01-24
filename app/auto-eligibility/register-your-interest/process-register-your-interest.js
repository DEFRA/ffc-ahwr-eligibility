const schema = require('./register-your-interest.schema')
const checkEligibility = require('./check-eligibility')
const processEligibleSbi = require('./process-eligible-sbi')
const processIneligibleSbi = require('./process-ineligible-sbi')

const processRegisterYourInterest = async (request) => {
  console.log(`${new Date().toISOString()} Processing register your interest: ${JSON.stringify(request)}`)
  const req = schema.validate(request)
  if (req.error) {
    throw new Error(req.error)
  }
  const { sbi, crn, email: businessEmail } = req.value
  const customer = await checkEligibility(sbi, crn, businessEmail)
  if (customer.isRegisteringForEligibleSbi()) {
    await processEligibleSbi(customer)
  } else {
    await processIneligibleSbi(customer)
  }
}

module.exports = processRegisterYourInterest
