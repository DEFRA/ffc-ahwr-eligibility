const { checkEligibility, updateWaiting, processIneligible } = require('../../auto-eligibility/processing')

const processRegisterYourInterestMessage = async (message) => {
  console.log(`Reading message from queue with body ${JSON.stringify(message.body)}`)
  // message validation
  const interestRequest = message.body
  const { sbi, crn } = interestRequest
  const eligible = await checkEligibility(sbi, crn)
  eligible ? await updateWaiting(sbi, crn) : processIneligible(interestRequest)
}

module.exports = processRegisterYourInterestMessage
