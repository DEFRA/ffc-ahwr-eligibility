const REGISTER_YOUR_INTEREST_SCHEMA = require('../schemas/register-your-interest.schema')
const BUSINESS_EMAIL_SCHEMA = require('../schemas/business-email.schema.js')
const checkEligibility = require('./check-eligibility')
const processEligibleSbi = require('./process-eligible-sbi')
const processIneligibleSbi = require('./process-ineligible-sbi')
const processUniqueEmail = require('./process-unique-email')
const defraIdEnabled = require('../config').defraId.enabled
const checkUniqueRegistrationOfInterest = require('./check-unique-registration-of-interest')

const processRegisterYourInterest = async (request) => {
  console.log(`${new Date().toISOString()} Processing register your interest: ${JSON.stringify(request)}`)
  if (defraIdEnabled === false) {
    const req = REGISTER_YOUR_INTEREST_SCHEMA.validate(request)
    if (req.error) {
      throw new Error(req.error)
    }
    const { sbi, crn, email: businessEmail } = req.value
    const customer = await checkEligibility(sbi, crn.toString(), businessEmail)
    if (customer.isRegisteringForEligibleSbi) {
      await processEligibleSbi(customer)
    } else {
      await processIneligibleSbi(customer)
    }
  } else {
    const req = BUSINESS_EMAIL_SCHEMA.validate(request.email)
    if (req.error) {
      throw new Error(req.error)
    }
    const businessEmail = req.value
    const isUnique = await checkUniqueRegistrationOfInterest(businessEmail)
    if (isUnique === true) {
      await processUniqueEmail(businessEmail)
    } else {
      console.log(`${new Date().toISOString()} Duplicate registration of interest: ${JSON.stringify({ businessEmail })}`)
    }
  }
}

module.exports = processRegisterYourInterest
