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
      farmerName: 'David Smith',
      name: 'David\'s Farm',
      sbi: '441111114',
      cph: '44/333/1112',
      address: 'Some Road, London, MK55 7ES',
      email: 'name@email.com'
    }
    return h
      .response(response)
      .code(200)
  }
}
