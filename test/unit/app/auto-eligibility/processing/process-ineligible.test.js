const MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION = '7a0ce567-d908-4f35-a858-de9e8f5445ec'

const MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS = 'eat@email.com'

describe('Process ineligible application', () => {
  let notifyClient
  let processIneligible

  beforeAll(() => {
    jest.mock('../../../../../app/client/notify-client')
    jest.mock('../../../../../app/config/notify', () => ({
      apiKey: 'mockApiKey'
    }))
    notifyClient = require('../../../../../app/client/notify-client')
    jest.mock('../../../../../app/auto-eligibility/config', () => ({
      emailNotifier: {
        earlyAdoptionTeam: {
          emailAddress: MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
        },
        emailTemplateIds: {
          ineligibleApplication: MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION
        }
      }
    }))

    processIneligible = require('../../../../../app/auto-eligibility/processing/process-ineligible')
  })

  afterAll(() => {
    jest.resetModules()
  })

  test('it sends an ineligible application email', async () => {
    const sbi = 123456789
    const crn = '1234567890'
    const businessEmail = 'business@email.com'

    await processIneligible(sbi, crn, businessEmail)

    expect(notifyClient.sendEmail).toHaveBeenCalledWith(
      MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION,
      MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS,
      {
        personalisation: {
          sbi,
          crn,
          businessEmail
        }
      }
    )
  })
})
