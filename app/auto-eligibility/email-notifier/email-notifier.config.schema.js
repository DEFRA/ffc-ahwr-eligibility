const Joi = require('joi')

module.exports = Joi.object({
  emailTemplateIds: {
    waitingList: Joi.string().uuid(),
    applyServiceInviteV2: Joi.string().uuid()
  },
  applyService: {
    uri: Joi.string().uri(),
    vetGuidance: Joi.string().uri()
  }
})
