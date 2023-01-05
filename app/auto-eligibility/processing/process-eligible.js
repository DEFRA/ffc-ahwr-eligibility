const logger = require('../../logger')
const updateWaiting = require('./update-waiting')
const emailNotifier = require('../email-notifier')

const processEligible = async (sbi, crn, businessEmailAddress, waitingListUpdatedTimestamp, accessGranted) => {
  logger.logTrace('Processing as eligible', {
    sbi,
    crn,
    businessEmailAddress,
    waitingListUpdatedTimestamp,
    accessGranted
  })
  if (waitingListUpdatedTimestamp) {
    logger.logTrace('Farmer already added to the waiting list', {
      sbi,
      crn,
      businessEmailAddress,
      waitingListUpdatedTimestamp,
      accessGranted
    })
  } else {
    await updateWaiting(sbi, crn)
    await emailNotifier.sendWaitingListEmail(businessEmailAddress)
  }
}

module.exports = processEligible
