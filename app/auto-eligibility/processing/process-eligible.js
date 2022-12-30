const updateWaiting = require('./update-waiting')
const emailNotifier = require('../email-notifier')

const processEligible = async (sbi, crn, businessEmailAddress, waitingListUpdatedTimestamp, accessGranted) => {
  console.log(`Processing as eligible: ${JSON.stringify({ sbi, crn, businessEmailAddress, waitingListUpdatedTimestamp, accessGranted })}.`)
  if (waitingListUpdatedTimestamp) {
    console.log(`Farmer already added to waiting list on ${waitingListUpdatedTimestamp} with access granted status of ${accessGranted}.`)
  } else {
    await updateWaiting(sbi, crn)
    await emailNotifier.sendWaitingListEmail(businessEmailAddress)
  }
}

module.exports = processEligible
