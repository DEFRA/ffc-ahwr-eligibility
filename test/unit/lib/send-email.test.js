const error = new Error('Test exception')
error.response = { data: 'failed to send email' }
const templateId = 'test-template'
const email = 'test@unit-test.com'
const options = { reference: 'EJ134S' }

describe('Send email test', () => {
  const mockNotifyConfig = { apiKey: 'someKey' }
  let sendEmail
  let notifyClient

  beforeAll(() => {
    jest.resetModules()
    jest.resetAllMocks()
    sendEmail = require('../../../app/lib/send-email')
    notifyClient = require('../../../app/client/notify-client')
    notifyClient.sendEmail = jest.fn().mockResolvedValueOnce(true).mockRejectedValueOnce(error)
    jest.mock('../../../app/config/notify', () => mockNotifyConfig)
    require('../../../app/config/notify')
  })

  test('Returns true successful email', async () => {
    const response = await sendEmail(templateId, email, options)
    expect(response).toBe(true)
  })

  test('Returns false on error sending email', async () => {
    const response = await sendEmail(templateId, email, options)
    expect(response).toBe(false)
  })
})
