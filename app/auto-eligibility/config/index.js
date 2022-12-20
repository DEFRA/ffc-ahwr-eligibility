const Joi = require('joi')

const schema = Joi.object({
  earlyAdoptionTeam: {
    emailAddress: Joi.string().trim().email()
  },
  emailTemplateIds: {
    waitingList: Joi.string().uuid(),
    genericIneligible: Joi.string().uuid(),
    applyServiceInvite: Joi.string().uuid(),
    ineligibleApplication: Joi.string().uuid()
  },
  waitingListScheduler: {
    enabled: Joi.bool().default(true),
    schedule: Joi.string().default('0 9 * * TUE'), // At 09:00 AM, only on Tuesday
    upperLimit: Joi.number().default(50)
  }
})

const config = {
  earlyAdoptionTeam: {
    emailAddress: process.env.EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
  },
  emailTemplateIds: {
    waitingList: process.env.WAITING_LIST_TEMPLATE_ID,
    genericIneligible: process.env.INELIGIBLE_GENERIC_TEMPLATE_ID,
    applyServiceInvite: process.env.APPLY_INVITE_TEMPLATE_ID,
    ineligibleApplication: process.env.INELIGIBLE_APPLICATION_EMAIL_TEMPLATE_ID
  },
  waitingListScheduler: {
    enabled: process.env.WAITING_LIST_SCHEDULER_ENABLED,
    schedule: process.env.WAITING_LIST_SCHEDULE,
    upperLimit: process.env.WAITING_LIST_THRESHOLD_UPPER_LIMIT
  }
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  console.log(error)
  throw new Error(`The auto eligibility configuration config is invalid. ${error.message}`)
}

module.exports = { ...value }
