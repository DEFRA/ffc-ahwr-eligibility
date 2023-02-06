const Joi = require('joi')

const schema = Joi.object({
  emailNotifier: require('../email-notifier/email-notifier.config.schema'),
  waitingListScheduler: {
    enabled: Joi.bool().default(true),
    schedule: Joi.string().default('0 9 * * TUE'), // At 09:00 AM, only on Tuesday
    upperLimit: Joi.number().default(50)
  },
  selectYourBusiness: {
    enabled: Joi.bool().default(false)
  }
})

const config = {
  emailNotifier: require('../email-notifier/email-notifier.config'),
  waitingListScheduler: {
    enabled: process.env.WAITING_LIST_SCHEDULER_ENABLED,
    schedule: process.env.WAITING_LIST_SCHEDULE,
    upperLimit: process.env.WAITING_LIST_THRESHOLD_UPPER_LIMIT
  },
  selectYourBusiness: {
    enabled: process.env.SELECT_YOUR_BUSINESS_ENABLED
  }
}

const { error, value } = schema.validate(config, { abortEarly: false })

if (error) {
  console.log(error)
  throw new Error(`The auto eligibility configuration config is invalid. ${error.message}`)
}

module.exports = { ...value }
