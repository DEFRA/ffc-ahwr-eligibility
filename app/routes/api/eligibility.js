const Joi = require('joi')

const ERROR_MESSAGE = {
  invalidEmailAddress: 'A valid email address must be specified.'
}

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
        .messages({
          'any.required': ERROR_MESSAGE.invalidEmailAddress,
          'string.base': ERROR_MESSAGE.invalidEmailAddress,
          'string.empty': ERROR_MESSAGE.invalidEmailAddress,
          'string.email': ERROR_MESSAGE.invalidEmailAddress
        })
      }).options({
        stripUnknown: true
      }),
      failAction(request, h, err) {
        request.log('error', err);
        throw err;
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
