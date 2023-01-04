const Joi = require('joi')

module.exports = Joi.object({
  connectionString: Joi.string().trim().allow(''),
  roleName: Joi.string().trim().allow('')
})
