const schema = require('./email-notifier.config.schema')

const config = {
  emailTemplateIds: {
    waitingList: process.env.NOTIFY_TEMPLATE_ID_WAITING_LIST,
    applyServiceInviteV2: process.env.NOTIFY_TEMPLATE_ID_APPLY_INVITE_DEFRA_ID
  },
  applyService: {
    uri: process.env.APPLY_SERVICE_URI,
    vetGuidance: process.env.APPLY_SERVICE_URI + '/guidance-for-vet'
  }
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  console.log(error)
  throw new Error(`The auto eligibility configuration config is invalid. ${error.message}`)
}

module.exports = { ...value }
