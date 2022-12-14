const { checkEligibility } = require('../../eligibility')

const processRegisterYourInterestMessage = async (message) => {
  console.log(`Reading message from queue with body ${JSON.stringify(message.body)}`)
  const interestRequest = message.body
  const { sbi, crn } = interestRequest
  const eligible = await checkEligibility(sbi, crn)
  console.log(`sbi ${sbi} eligbility is ${eligible}.`)
}

module.exports = processRegisterYourInterestMessage

