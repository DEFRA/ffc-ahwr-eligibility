const logger = require('../logger')
const notifyClient = require('../client/notify-client')

module.exports = async (templateId, emailAddress, options) => {
  try {
    logger.logTrace('Attempting to send an email', {
      emailAddress,
      templateId
    })
    await notifyClient.sendEmail(templateId, emailAddress, options)
    logger.logTrace('Email has been sent successfully', {
      emailAddress,
      templateId
    })
    return true
  } catch (e) {
    logger.logError(e, 'Failed to send an email', {
      emailAddress,
      templateId: templateId,
      errors: e.response.data.errors
    })
    return false
  }
}
