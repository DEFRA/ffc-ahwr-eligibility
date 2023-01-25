const Joi = require('joi')

module.exports = Joi.object({
  email: Joi
    .string()
    .trim()
    .lowercase()
    .email()
    .required()
})
