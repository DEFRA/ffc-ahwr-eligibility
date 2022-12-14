// const { checkEligibility, updateWaiting, processUnEligible } = require('../../eligibility')

const processRegisterYourInterestMessage = async (message) => {
  console.log(`Reading message from queue with body ${JSON.stringify(message.body)}`)
  // message validation
  // const interestRequest = message.body
  // const { sbi, crn } = interestRequest
  // const eligible = await checkEligibility(sbi, crn)
  // eligible ? await updateWaiting(sbi, crn) : processUnEligible(interestRequest)
}

module.exports = processRegisterYourInterestMessage
