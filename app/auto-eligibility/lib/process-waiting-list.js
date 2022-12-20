const applyServiceUri = require('../config').applyServiceUri
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
      sendApplyGuidanceEmail(farmer.business_email, applyServiceUri)
    })
  } catch (e) {
    console.error('Error processing waiting list.', e)
  }
}

module.exports = processWaitingList
