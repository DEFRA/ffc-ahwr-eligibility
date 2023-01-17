const Joi = require('joi')

module.exports = Joi.object({
  sbi: Joi
    .number()
    .min(100000000)
    .max(999999999)
    .required(),
  crn: Joi
    .string()
    .trim()
    .regex(/^\d{10}$/)
    .required(),
  email: Joi
    .string()
    .trim()
    .lowercase()
    .email()
    .required()
})
