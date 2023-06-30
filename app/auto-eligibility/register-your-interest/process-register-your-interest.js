const BUSINESS_EMAIL_SCHEMA = require('../schemas/business-email.schema.js')
const processUniqueEmail = require('./process-unique-email')
const checkUniqueRegistrationOfInterest = require('./check-unique-registration-of-interest')

const processRegisterYourInterest = async (request) => {
  console.log(`${new Date().toISOString()} Processing register your interest: ${JSON.stringify(request)}`)
  const req = BUSINESS_EMAIL_SCHEMA.validate(request.email)
  if (req.error) {
    throw new Error(req.error)
  }
  const businessEmail = req.value
  const isUnique = await checkUniqueRegistrationOfInterest(businessEmail)
  if (isUnique) {
    await processUniqueEmail(businessEmail)
  } else {
    console.log(`${new Date().toISOString()} Duplicate registration of interest: ${JSON.stringify({ businessEmail })}`)
  }
}

module.exports = processRegisterYourInterest
