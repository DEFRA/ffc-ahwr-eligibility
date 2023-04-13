const waitingListTable = require('../db/waiting-list.db.table')

const checkUniqueRegistrationOfInterest = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Checking unique registration: ${JSON.stringify({ businessEmail })}`)
  const customers = await waitingListTable.findAllByBusinessEmail(businessEmail)
  if (customers.length === 0) {
    console.log(`${new Date().toISOString()} Email is unique: ${JSON.stringify({ businessEmail })}`)
    return true
  } else {
    console.log(`${new Date().toISOString()} Email already registered: ${JSON.stringify({ customers })}`)
    return false
  }
}

module.exports = checkUniqueRegistrationOfInterest
