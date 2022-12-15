const { emailTemplateIds } = require('../config/index')
const sendEmail = require('../../lib/send-email')

const sendIneligibleEmail = async (email) => {
  await sendEmail(emailTemplateIds.genericIneligible, email)
}

const sendWaitingListEmail = async (email) => {
  await sendEmail(emailTemplateIds.waitingList, email)
}

const sendApplyGuidanceEmail = async (email, applyUrl) => {
  await sendEmail(emailTemplateIds.applyServiceInvite, email, { personalisation: { applyGuidanceUrl: applyUrl } })
}

module.exports = { sendIneligibleEmail, sendApplyGuidanceEmail, sendWaitingListEmail }
