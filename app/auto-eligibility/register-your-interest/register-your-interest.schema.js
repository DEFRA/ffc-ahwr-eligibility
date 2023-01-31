const Joi = require('joi')
const SBI_SCHEMA = require('./sbi.schema')
const CRN_SCHEMA = require('./crn.schema')
const BUSINESS_EMAIL_SCHEMA = require('./business-email.schema')

module.exports = Joi.object({
  sbi: SBI_SCHEMA,
  crn: CRN_SCHEMA,
  email: BUSINESS_EMAIL_SCHEMA
})
