const emailNotifier = require('../email-notifier')
const waitingListTable = require('../db/waiting-list.db.table')

const processUniqueEmail = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Processing unique business email: ${JSON.stringify({
    businessEmail
  })}`)
  await waitingListTable.registerInterest(businessEmail)
  await emailNotifier.sendWaitingListEmail(businessEmail)
}

module.exports = processUniqueEmail
