const waitingListTable = require('../db/waiting-list.db.table')

const checkUniqueRegistrationOfInterest = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Checking unique registration: ${JSON.stringify({ businessEmail })}`)
  const customers = await waitingListTable.findAllByBusinessEmail(businessEmail)
  if (customers.length === 0) {
    return true
  } else {
    console.log(`${new Date().toISOString()} Email already registered: ${JSON.stringify(customers)}`)
    return false
  }
}

module.exports = checkUniqueRegistrationOfInterest
