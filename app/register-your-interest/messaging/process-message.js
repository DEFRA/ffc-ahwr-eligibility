const { checkEligibility, processEligible, processIneligible } = require('../../auto-eligibility/processing')

const processRegisterYourInterestMessage = async (message) => {
  console.log(`Reading message from queue with body ${JSON.stringify(message.body)}`)
  // message validation
  const interestRequest = message.body
  const { sbi, crn } = interestRequest
  const eligible = await checkEligibility(sbi, crn)
  if (eligible) {
    console.log(`sbi: ${sbi}, crn: ${crn} is eligible`)
    await processEligible(sbi, crn)
  } else {
    console.log(`sbi: ${sbi}, crn: ${crn} is not eligible`)
    processIneligible(interestRequest)
  }
}

module.exports = processRegisterYourInterestMessage
