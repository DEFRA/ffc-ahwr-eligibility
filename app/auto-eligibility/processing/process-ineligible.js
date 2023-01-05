const logger = require('../../logger')
const emailNotifier = require('../email-notifier')

const processIneligible = async (sbi, crn, businessEmail) => {
  logger.logTrace('Processing as ineligible', {
    sbi,
    crn,
    businessEmail
  })
  await emailNotifier.sendIneligibleApplicationEmail(
    sbi,
    crn,
    businessEmail
  )
}

module.exports = processIneligible
