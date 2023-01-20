const { sendApplyGuidanceEmail } = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')

const processWaitingList = async (upperlimit) => {
  console.log(`${new Date().toISOString()} Executing process waiting list with limit of ${upperlimit}.`)

  const result = await customerDbTable.updateAccessGranted(upperlimit)
  const farmersCount = result[0]
  const farmers = result[1]
  console.log(`${new Date().toISOString()} ${farmersCount} customers moved from the waiting list.`)
  farmers.forEach(farmer => {
    sendApplyGuidanceEmail(farmer.business_email)
  })
}

module.exports = processWaitingList
