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
    waitingList: process.env.NOTIFY_TEMPLATE_ID_WAITING_LIST,
    genericIneligible: process.env.NOTIFY_TEMPLATE_ID_INELIGIBLE_GENERIC,
    applyServiceInvite: process.env.NOTIFY_TEMPLATE_ID_APPLY_INVITE,
    ineligibleApplication: process.env.NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION
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
