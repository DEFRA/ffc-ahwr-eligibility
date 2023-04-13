const MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION = '7a0ce567-d908-4f35-a858-de9e8f5445ec'
const MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS = 'eat@email.com'

const MOCK_NOW = new Date()

describe('Process ineligible email', () => {
  let logSpy
  let notifyClient
  let processDuplicateEmail

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../app/app-insights/app-insights.config', () => ({
      appInsightsCloudRole: 'mock_app_insights_cloud_role'
    }))
    jest.mock('../../../../app/notify/notify-client')
    jest.mock('../../../../app/config/notify', () => ({
      apiKey: 'mockApiKey'
    }))
    notifyClient = require('../../../../app/notify/notify-client')
    jest.mock('../../../../app/auto-eligibility/config', () => ({
      emailNotifier: {
        earlyAdoptionTeam: {
          emailAddress: MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
        },
        emailTemplateIds: {
          ineligibleApplication: MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION
        }
      },
      defraId: {
        enabled: true
      }
    }))

    processDuplicateEmail = require('../../../../app/auto-eligibility/register-your-interest/process-duplicate-email')

    logSpy = jest.spyOn(console, 'log')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetModules()
    jest.useRealTimers()
    jest.resetAllMocks()
  })

  test.each([
    {
      toString: () => 'an duplicate email',
      given: {
        businessEmail: 'business@email.com'
      },
      expect: {
        emailNotifier: {
          emailTemplateId: MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION,
          emailAddressTo: MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
        },
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing duplicate business email: ${JSON.stringify({
            businessEmail: 'business@email.com'
          })}`,
          `${MOCK_NOW.toISOString()} Attempting to send email with template ID ${MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION} to email ${MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS}`,
          `${MOCK_NOW.toISOString()} Successfully sent email with template ID ${MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION} to email ${MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    await processDuplicateEmail(testCase.given.businessEmail)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(notifyClient.sendEmail).toHaveBeenCalledWith(
      MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION,
      MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS,
      {
        personalisation: {
          sbi: 'n/a',
          crn: 'n/a',
          businessEmail: testCase.given.businessEmail
        }
      }
    )
  })
})
