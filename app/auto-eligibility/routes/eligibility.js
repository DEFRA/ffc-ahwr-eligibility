const Joi = require('joi')
const Boom = require('@hapi/boom')
const eligibilityDbTable = require('../db/eligibility.db.table')

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
  handler: async (request, h) => {
    try {
      const farmer = await eligibilityDbTable.findByBusinessEmail(
        request.query.emailAddress
      )
      if (!farmer || !farmer.access_granted) {
        return Boom.notFound('Farmer not found')
      }
      return h
        .response({
          farmerName: farmer.customer_name,
          name: farmer.business_name,
          sbi: farmer.sbi,
          crn: farmer.crn,
          address: farmer.business_address,
          email: farmer.business_email
        })
        .code(200)
    } catch (error) {
      console.error(error)
      throw Boom.internal(error)
    }
  }
}
