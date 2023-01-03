const Joi = require('joi')

module.exports = Joi.object({
  connectionString: Joi.string().trim().allow(''),
  appName: Joi.string().trim().allow('')
})
