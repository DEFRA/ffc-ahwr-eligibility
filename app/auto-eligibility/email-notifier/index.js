const sendEmail = require('../../lib/send-email')
const config = require('../config')

const sendIneligibleApplicationEmail = async (sbi, crn, businessEmail) => {
  await sendEmail(
    config.emailNotifier.emailTemplateIds.ineligibleApplication,
    config.emailNotifier.earlyAdoptionTeam.emailAddress,
    {
      personalisation: {
        sbi,
        crn,
        businessEmail
      }
    }
  )
}

const sendIneligibleEmail = async (email) => {
  await sendEmail(
    config.emailNotifier.emailTemplateIds.genericIneligible,
    email
  )
}

const sendWaitingListEmail = async (email) => {
  await sendEmail(
    config.emailNotifier.emailTemplateIds.waitingList,
    email
  )
}

const sendApplyGuidanceEmail = async (email, applyGuidanceUrl) => {
  await sendEmail(
    config.emailNotifier.emailTemplateIds.applyServiceInvite,
    email,
    {
      personalisation: {
        applyGuidanceUrl
      }
    }
  )
}

module.exports = {
  sendIneligibleApplicationEmail,
  sendIneligibleEmail,
  sendApplyGuidanceEmail,
  sendWaitingListEmail
}
