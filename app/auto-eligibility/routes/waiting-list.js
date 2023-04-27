const Joi = require('joi')
const Boom = require('@hapi/boom')
const waitingListTable = require('../db/waiting-list.db.table')
const { sendMonitoringEvent } = require('../../event')

const getIp = (request) => {
  const xForwardedForHeader = request.headers['x-forwarded-for']
  return xForwardedForHeader ? xForwardedForHeader.split(',')[0] : request.info.remoteAddress
}

module.exports = {
  method: 'GET',
  path: '/api/waiting-list/check-duplicate-registration',
  options: {
    validate: {
      query: Joi.object({
        emailAddress: Joi
          .string()
          .trim()
          .lowercase()
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
    console.log(`Checking if email address ${request.query.emailAddress} is already registered`)
    try {
      const farmer = await waitingListTable.findAllByBusinessEmail(
        request.query.emailAddress
      )
      if (!farmer) {
        return h
          .response({
            alreadyRegistered: false,
            accessGranted: false
          })
          .code(200)
      }
      return h
        .response({
          alreadyRegistered: true,
          accessGranted: farmer[0].access_granted
        })
        .code(200)
    } catch (error) {
      console.error(error)
      await sendMonitoringEvent(request.yar.id, error.message, request.query.emailAddress, getIp(request))
      throw Boom.internal(error)
    }
  }
}
