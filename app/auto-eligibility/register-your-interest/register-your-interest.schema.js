const Joi = require('joi')

const MIN_SBI_NUMBER = 105000000
const MAX_SBI_NUMBER = 210000000
const MIN_CRN_NUMBER = 1100000000
const MAX_CRN_NUMBER = 1110000000

module.exports = Joi.object({
  sbi: Joi
    .number()
    .required()
    .integer()
    .min(MIN_SBI_NUMBER)
    .max(MAX_SBI_NUMBER)
    .less(1000000000)
    .greater(99999999.9),
  crn: Joi
    .number()
    .required()
    .integer()
    .min(MIN_CRN_NUMBER)
    .max(MAX_CRN_NUMBER)
    .less(10000000000)
    .greater(999999999.9),
  email: Joi
    .string()
    .trim()
    .lowercase()
    .email()
    .required()
})
