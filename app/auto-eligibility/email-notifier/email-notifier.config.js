const schema = require('./email-notifier.config.schema')

const config = {
  earlyAdoptionTeam: {
    emailAddress: process.env.NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
  },
  emailTemplateIds: {
    waitingList: process.env.NOTIFY_TEMPLATE_ID_WAITING_LIST,
    genericIneligible: process.env.NOTIFY_TEMPLATE_ID_INELIGIBLE_GENERIC,
    applyServiceInvite: process.env.NOTIFY_TEMPLATE_ID_APPLY_INVITE,
    ineligibleApplication: process.env.NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION
  },
  applyService: {
    uri: process.env.APPLY_SERVICE_URI,
    vetGuidance: process.env.APPLY_SERVICE_URI + '/guidance-for-vet'
  }
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  throw new Error(`The auto eligibility configuration config is invalid. ${error.message}`)
}

module.exports = { ...value }
