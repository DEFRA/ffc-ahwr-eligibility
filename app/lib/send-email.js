const notifyClient = require('../client/notify-client')

module.exports = async (templateId, email, options) => {
  try {
    console.log(`Attempting to send email with template ID ${templateId} to email ${email}`)
    await notifyClient.sendEmail(templateId, email, options)
    console.log(`Successfully sent email with template ID ${templateId} to email ${email}.`)
    return true
  } catch (e) {
    console.error(`Error occurred during sending email of to ${email} with template ID ${templateId}.`, e)
    return false
  }
}