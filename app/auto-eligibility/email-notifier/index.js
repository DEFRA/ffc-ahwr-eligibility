const sendEmail = require('../../notify/send-email')
const config = require('../config')

const sendWaitingListEmail = async (email) => {
  await sendEmail(
    config.emailNotifier.emailTemplateIds.waitingList,
    email
  )
}

const sendApplyGuidanceEmail = async (email) => {
  await sendEmail(
    config.emailNotifier.emailTemplateIds.applyServiceInvite,
    email,
    {
      personalisation: {
        applyGuidanceUrl: config.emailNotifier.applyService.uri,
        applyVetGuidanceUrl: config.emailNotifier.applyService.vetGuidance
      }
    }
  )
}

module.exports = {
  sendApplyGuidanceEmail,
  sendWaitingListEmail
}
