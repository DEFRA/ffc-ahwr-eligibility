const Joi = require('joi')
const Boom = require('@hapi/boom')

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
      failAction (request, h, err) {
        throw Boom.badRequest('A valid email address must be specified.')
      }
    }
  },
  handler: (request, h) => {
    const response = {
      farmerName: 'Marcin Mogiela',
      name: 'Marcin\'s Farm',
      sbi: '772222224',
      cph: '88/222/2224',
      address: 'Some Road, London, MK45 9ES',
      email: 'marcinmo@kainos.com'
    }
    return h
      .response(response)
      .code(200)
  }
}
