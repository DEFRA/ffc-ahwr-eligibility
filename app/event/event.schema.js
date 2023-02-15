const Joi = require('joi')

const schema = Joi.object({
  name: Joi.string().required(),
  properties: Joi.object({
    id: Joi.string().required(),
    sbi: Joi.string().required(),
    cph: Joi.string().required(),
    checkpoint: Joi.string().required(),
    status: Joi.string().required(),
    ip: Joi.string().optional(),
    action: Joi.object({
      type: Joi.string().required(),
      message: Joi.string().required(),
      data: Joi.object(),
      raisedOn: Joi.date().required(),
      raisedBy: Joi.string().required()
    }).required()
  })
})

module.exports = schema
