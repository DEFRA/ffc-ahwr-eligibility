const Joi = require('joi')

const schema = Joi.object({
  emailTemplates: {
    waitingList: Joi.string().uuid(),
    genericIneligible: Joi.string().uuid(),
    applyServiceInvite: Joi.string().uuid()
  }
})

const config = {
  emailTemplates: {
    waitingList: process.env.NOTIFY_TEMPLATE_ID_WAITING_LIST,
    genericIneligible: process.env.NOTIFY_TEMPLATE_ID_INELIGIBLE_GENERIC,
    applyServiceInvite: process.env.NOTIFY_TEMPLATE_ID_APPLY_INVITE
  }
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  console.log(error)
  throw new Error(`The message queue config is invalid. ${error.message}`)
}

module.exports = { ...value }
