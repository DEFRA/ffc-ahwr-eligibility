const { sendApplyGuidanceEmail } = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')

const processWaitingList = async (upperlimit) => {
  console.log(`Executing process waiting list with limit of ${upperlimit}.`)
  try {
    const result = await customerDbTable.updateAccessGranted(upperlimit)
    const farmersCount = result[0]
    const farmers = result[1]
    console.log(`${farmersCount} farmers moved from the waiting list.`)
    farmers.forEach(farmer => {
      sendApplyGuidanceEmail(farmer.business_email)
    })
  } catch (e) {
    console.error('Error processing waiting list.', e)
  }
}

module.exports = processWaitingList
