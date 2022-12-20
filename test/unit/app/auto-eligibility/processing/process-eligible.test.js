const MOCK_NOW = new Date(2020, 3, 1, 13, 30, 45)

const MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID = '9d9fb4dc-93f8-44b0-be28-a53524535db7'

describe('Process eligible', () => {
  let db
  let notifyClient
  let processEligible

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../../app/data')
    db = require('../../../../../app/data')
    jest.mock('../../../../../app/client/notify-client')
    jest.mock('../../../../../app/config/notify', () => ({
      apiKey: 'mockApiKey'
    }))
    notifyClient = require('../../../../../app/client/notify-client')
    jest.mock('../../../../../app/auto-eligibility/config', () => ({
      emailTemplateIds: {
        waitingList: MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID
      }
    }))

    processEligible = require('../../../../../app/auto-eligibility/processing/process-eligible')
  })

  afterAll(() => {
    jest.useRealTimers()
    jest.resetModules()
  })

  test('it updates the eligibility table and sends a waiting list email', async () => {
    const sbi = 123456789
    const crn = '1234567890'
    const businessEmailAddress = 'name@email.com'

    await processEligible(sbi, crn, businessEmailAddress)

    expect(db.eligibility.update).toHaveBeenCalledWith({
      last_updated_at: MOCK_NOW,
      waiting_updated_at: MOCK_NOW
    }, {
      lock: true,
      where: {
        crn,
        sbi
      }
    })
    expect(notifyClient.sendEmail).toHaveBeenCalledWith(
      MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID,
      businessEmailAddress,
      undefined
    )
  })
})
