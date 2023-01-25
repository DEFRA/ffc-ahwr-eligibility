const Joi = require('joi')
const SBI_SCHEMA = require('./sbi.schema')
const CRN_SCHEMA = require('./crn.schema')
const EMAIL_SCHEMA = require('./email.schema')

module.exports = Joi.object({
  sbi: SBI_SCHEMA,
  crn: CRN_SCHEMA,
  email: EMAIL_SCHEMA
})
