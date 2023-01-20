const Joi = require('joi')

module.exports = Joi.object({
  applicationInsightsConnectionString: Joi
    .string()
    .allow(null)
    .allow('')
    .optional(),
  appInsightsCloudRole: Joi
    .string()
    .allow(null)
    .allow('')
    .optional()
})
