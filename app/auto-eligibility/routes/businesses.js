const Joi = require('joi')
const Boom = require('@hapi/boom')
const customerDbTable = require('../db/customer.db.table')

module.exports = {
  method: 'GET',
  path: '/api/businesses',
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
      const farmers = await customerDbTable.findAllByBusinessEmailAndAccessGranted(
        request.query.emailAddress,
        true
      )
      if (!farmers || farmers.length === 0) {
        return Boom.notFound('No farmer found')
      }
      return h.response(
        farmers.map(farmer => ({
          farmerName: farmer.customer_name,
          name: farmer.business_name,
          sbi: farmer.sbi,
          crn: farmer.crn,
          address: farmer.business_address,
          email: farmer.business_email
        }))
      )
        .code(200)
    } catch (error) {
      console.error(error)
      throw Boom.internal(error)
    }
  }
}
