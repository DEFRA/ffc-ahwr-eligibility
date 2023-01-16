const emailNotifier = require('../email-notifier')

const processIneligibleSbi = async (customer) => {
  console.log(`Processing ineligible SBI: ${JSON.stringify({
    ...customer
  })}`)
  await emailNotifier.sendIneligibleApplicationEmail(
    customer.sbi,
    customer.crn,
    customer.businessEmail
  )
}

module.exports = processIneligibleSbi
