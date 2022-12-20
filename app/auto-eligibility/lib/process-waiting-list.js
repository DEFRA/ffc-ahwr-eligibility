// const retrieveWaitingList = require('../../auto-eligibility/processing/retrieve-waiting-list')
const updateAccessGranted = require('../../auto-eligibility/processing/update-access-granted')
const { sendApplyGuidanceEmail } = require('../../auto-eligibility/email')

const processWaitingList = async (upperlimit) => {
  console.log(`Executing process waiting list with limit of ${upperlimit}.`)
  try {
    const result = await updateAccessGranted()
    const updatedRows = result[0]
    const rowsUpdated = result[1]
    console.log(`${updatedRows} farmers moved from the waiting list.`)
    rowsUpdated.forEach(farmer => {
      sendApplyGuidanceEmail('liam.wilson@kainos.com','http://localhost:3000/apply')
    })
  } catch (e) {
    console.error('Error processing waiting list.', e)
  }
}

module.exports = { processWaitingList }
