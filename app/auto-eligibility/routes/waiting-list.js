const Joi = require('joi')
const Boom = require('@hapi/boom')
const waitingListTable = require('../db/waiting-list.db.table')
const { sendMonitoringEvent } = require('../../event')

module.exports = {
  method: 'GET',
  path: '/api/waiting-list',
  options: {
    validate: {
      query: Joi.object({
        emailAddress: Joi
          .string()
          .trim()
          .lowercase()
          .required()
          .email({ tlds: false })
      }).options({
        stripUnknown: true
      }),
      failAction (request, h, err) {
        throw Boom.badRequest('A valid email address must be specified.')
      }
    }
  },
  handler: async (request, h) => {
    console.log(`Checking if email address ${request.query.emailAddress} is on the waiting list.`)
    try {
      const farmer = await waitingListTable.findAllByBusinessEmail(
        request.query.emailAddress
      )
      if (!farmer || !farmer.length) {
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
      await sendMonitoringEvent(request.yar.id, error.message, request.query.emailAddress)
      throw Boom.internal(error)
    }
  }
}
