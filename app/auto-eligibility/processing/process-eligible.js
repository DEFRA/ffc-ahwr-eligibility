const updateWaiting = require('./update-waiting')
const emailNotifier = require('../email-notifier')

const processEligible = async (sbi, crn, businessEmailAddress) => {
  console.log(`Processing as eligible: ${JSON.stringify({ sbi, crn, businessEmailAddress })}`)
  await updateWaiting(sbi, crn)
  await emailNotifier.sendWaitingListEmail(businessEmailAddress)
}

module.exports = processEligible
