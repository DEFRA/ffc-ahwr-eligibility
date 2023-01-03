const Joi = require('joi')

module.exports = Joi.object({
  connectionString: Joi.string().trim(),
  appName: Joi.string().trim()
})
