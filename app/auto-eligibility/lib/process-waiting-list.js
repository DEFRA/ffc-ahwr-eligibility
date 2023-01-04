const updateAccessGranted = require('../../auto-eligibility/processing/update-access-granted')
const { sendApplyGuidanceEmail } = require('../../auto-eligibility/email-notifier')
const logger = require('../../logger')

const processWaitingList = async (upperlimit) => {
  logger.logTrace('Executing process waiting list', {
    upperlimit
  })
  try {
    const result = await updateAccessGranted()
    const farmersCount = result[0]
    const farmers = result[1]
    logger.logTrace('Farmers moved from the waiting list', {
      farmersCount
    })
    farmers.forEach(farmer => {
      sendApplyGuidanceEmail(farmer.business_email)
    })
  } catch (e) {
    logger.logError(e, 'Failed to process waiting list')
  }
}

module.exports = processWaitingList
