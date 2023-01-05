const logger = require('../../logger')
const { checkEligibility, processEligible, processIneligible } = require('../../auto-eligibility/processing')
const schema = require('./register-your-interest-request.schema')

const processRegisterYourInterestRequest = async (request) => {
  logger.logTrace('Processing register your interest request', {
    request
  })
  const req = schema.validate(request)
  if (req.error) {
    throw new Error(req.error)
  }
  const { sbi, crn, email } = req.value
  const eligible = await checkEligibility(sbi, crn, email)
  if (eligible) {
    const { waiting_updated_at: waitingUpdatedAt, access_granted: accessGranted } = eligible
    await processEligible(sbi, crn, email, waitingUpdatedAt, accessGranted)
  } else {
    await processIneligible(sbi, crn, email)
  }
}

module.exports = processRegisterYourInterestRequest
