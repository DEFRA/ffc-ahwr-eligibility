const sendEmail = require('../../lib/send-email')
const config = require('../config')

const sendIneligibleApplicationEmail = async (ineligibleApplicationData) => {
  await sendEmail(
    config.emailTemplateIds.ineligibleApplication,
    config.earlyAdoptionTeam.emailAddress,
    ineligibleApplicationData
  )
}

const sendIneligibleEmail = async (email) => {
  await sendEmail(config.emailTemplateIds.genericIneligible, email)
}

const sendWaitingListEmail = async (email) => {
  await sendEmail(config.emailTemplateIds.waitingList, email)
}

const sendApplyGuidanceEmail = async (email, applyUrl) => {
  await sendEmail(config.emailTemplateIds.applyServiceInvite, email, { personalisation: { applyGuidanceUrl: applyUrl } })
}

module.exports = {
  sendIneligibleApplicationEmail,
  sendIneligibleEmail,
  sendApplyGuidanceEmail,
  sendWaitingListEmail
}
