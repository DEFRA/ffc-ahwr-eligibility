const { sendApplyGuidanceEmail } = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')

const processWaitingList = async (upperLimit) => {
  console.log(`${new Date().toISOString()} Processing waiting list: ${JSON.stringify({ upperLimit })}`)
  const result = await customerDbTable.updateAccessGranted(upperLimit)
  const farmersCount = result[1]
  const farmers = result[0]
  console.log(`${new Date().toISOString()} ${farmersCount} customers moved from the waiting list.`)
  farmers.forEach(farmer => {
    sendApplyGuidanceEmail(farmer.business_email)
  })
}

module.exports = processWaitingList
