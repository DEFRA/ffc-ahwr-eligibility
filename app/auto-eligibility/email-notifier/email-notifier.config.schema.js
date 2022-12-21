const Joi = require('joi')

module.exports = Joi.object({
  earlyAdoptionTeam: {
    emailAddress: Joi.string().trim().email()
  },
  emailTemplateIds: {
    waitingList: Joi.string().uuid(),
    genericIneligible: Joi.string().uuid(),
    applyServiceInvite: Joi.string().uuid(),
    ineligibleApplication: Joi.string().uuid()
  },
  applyServiceUri: Joi.string().uri()
})
