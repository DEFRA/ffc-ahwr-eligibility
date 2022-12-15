const Joi = require('joi')

const schema = Joi.object({
  emailTemplateIds: {
    waitingList: Joi.string().uuid(),
    genericIneligible: Joi.string().uuid(),
    applyServiceInvite: Joi.string().uuid()
  }
})

const config = {
  emailTemplateIds: {
    waitingList: process.env.WAITING_LIST_TEMPLATE_ID_,
    genericIneligible: process.env.INELIGIBLE_GENERIC_TEMPLATE_ID,
    applyServiceInvite: process.env.APPLY_INVITE_TEMPLATE_ID
  }
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  console.log(error)
  throw new Error(`The auto eligibility configuration config is invalid. ${error.message}`)
}

module.exports = { ...value }
