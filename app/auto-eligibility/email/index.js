const { emailTemplates } = require('../config/index')
const sendEmail = require('../../lib/send-email')

const sendIneligibleEmail = async (email) => {
  await sendEmail(emailTemplates.genericIneligible, email)
}

const sendWaitingListEmail = async (email) => {
  await sendEmail(emailTemplates.waitingList, email)
}

const sendApplyGuidanceEmail = async (email, applyUrl) => {
  await sendEmail(emailTemplates.applyServiceInvite, email, { personalisation: { applyGuidanceUrl: applyUrl } })
}

module.exports = { sendIneligibleEmail, sendApplyGuidanceEmail, sendWaitingListEmail }
