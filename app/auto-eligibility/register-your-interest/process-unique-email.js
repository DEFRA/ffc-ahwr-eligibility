const waitingListTable = require('../db/waiting-list.db.table')

const processUniqueEmail = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Processing unique business email: ${JSON.stringify({
    businessEmail
  })}`)
  await waitingListTable.registerInterest(businessEmail)
}

module.exports = processUniqueEmail
