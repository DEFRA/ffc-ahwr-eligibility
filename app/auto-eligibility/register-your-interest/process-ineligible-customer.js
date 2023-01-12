const emailNotifier = require('../email-notifier')

const processIneligible = async (customer) => {
  console.log(`Processing ineligible customer: ${JSON.stringify({
    ...customer
  })}`)
  await emailNotifier.sendIneligibleApplicationEmail(
    customer.sbi,
    customer.crn,
    customer.businessEmail
  )
}

module.exports = processIneligible
