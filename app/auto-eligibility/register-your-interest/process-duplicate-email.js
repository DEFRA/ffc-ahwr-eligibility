const emailNotifier = require('../email-notifier')

const processDuplicateEmail = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Processing duplicate business email: ${JSON.stringify({
    businessEmail
  })}`)
  await emailNotifier.sendIneligibleDefraIdRegistrationEmail(businessEmail)
}

module.exports = processDuplicateEmail
