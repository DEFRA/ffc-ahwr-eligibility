const Joi = require('joi')
const Boom = require('@hapi/boom');

module.exports = {
  method: 'GET',
  path: '/api/eligibility',
  options: {
    validate: {
      query: Joi.object({
        emailAddress: Joi
          .string()
          .trim()
          .required()
          .email()
      }).options({
        stripUnknown: true
      }),
      failAction(request, h, err) {
        throw Boom.badRequest('A valid email address must be specified.');
      },
    },
  },
  handler: (request, h) => {
    const response = {
      eligible: true
    }
    return h
      .response(response)
      .code(200)
  }
}
