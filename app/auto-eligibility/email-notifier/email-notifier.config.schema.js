const Joi = require('joi')

module.exports = Joi.object({
  emailTemplateIds: {
    waitingList: Joi.string().uuid(),
    applyServiceInvite: Joi.string().uuid()
  },
  applyService: {
    uri: Joi.string().uri(),
    vetGuidance: Joi.string().uri()
  }
})
