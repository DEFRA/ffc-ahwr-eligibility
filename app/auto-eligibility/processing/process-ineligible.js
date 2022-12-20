const emailNotifier = require('../email-notifier')

const processIneligible = async (sbi, crn, businessEmail) => {
  console.log(`Processing as ineligible: ${JSON.stringify({ sbi, crn, businessEmail })}`)
  await emailNotifier.sendIneligibleApplicationEmail(
    sbi,
    crn,
    businessEmail
  )
}

module.exports = processIneligible
