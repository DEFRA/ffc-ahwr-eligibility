const telemetryEvent = require('../../../../app/auto-eligibility/telemetry/telemetry-event')

const MOCK_SEND_EVENT = jest.fn()
const MOCK_NOW = new Date()

const MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID = '9d9fb4dc-93f8-44b0-be28-a53524535db7'
const MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION = '7a0ce567-d908-4f35-a858-de9e8f5445ec'
const MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS = 'eat@email.com'

describe('processUniqueEmail', () => {
  let logSpy
  let db
  let processUniqueEmail

  beforeEach(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../app/config/notify', () => ({
      apiKey: 'mockApiKey'
    }))
    jest.mock('../../../../app/app-insights/app-insights.config', () => ({
      appInsightsCloudRole: 'mock_app_insights_cloud_role'
    }))
    jest.mock('../../../../app/auto-eligibility/config', () => ({
      emailNotifier: {
        emailTemplateIds: {
          waitingList: MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID,
          ineligibleApplication: MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION
        },
        earlyAdoptionTeam: {
          emailAddress: MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
        }
      },
      defraId: {
        enabled: true
      }
    }))

    jest.mock('ffc-ahwr-event-publisher', () => {
      return {
        PublishEvent: jest.fn().mockImplementation(() => {
          return {
            sendEvent: MOCK_SEND_EVENT
          }
        })
      }
    })

    logSpy = jest.spyOn(console, 'log')

    jest.mock('../../../../app/data')
    db = require('../../../../app/data')

    processUniqueEmail = require('../../../../app/auto-eligibility/register-your-interest/process-unique-email')
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.resetModules()
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  test.each([
    {
      toString: () => 'an unique email',
      given: {
        businessEmail: 'business@email.com'
      },
      expect: {
        emailNotifier: {
          emailTemplateId: MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID,
          emailAddressTo: MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
        },
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing unique business email: ${JSON.stringify({
            businessEmail: 'business@email.com'
          })}`,
          `${MOCK_NOW.toISOString()} Registering interest for business email: ${JSON.stringify({
            businessEmail: 'business@email.com'
          })}`,
          `${MOCK_NOW.toISOString()} Registered interest for business email: ${JSON.stringify('business@email.com')}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    db.waiting_list.create.mockReturnValue(testCase.given.businessEmail)
    await processUniqueEmail(testCase.given.businessEmail)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(db.waiting_list.create).toHaveBeenCalledWith({
      business_email: testCase.given.businessEmail,
      created_at: MOCK_NOW,
      access_granted: false,
      access_granted_at: null
    })
    expect(MOCK_SEND_EVENT).toHaveBeenCalledTimes(1)
    expect(MOCK_SEND_EVENT).toHaveBeenCalledWith({
      name: 'register-your-interest-event',
      properties: {
        id: testCase.given.businessEmail,
        sbi: 'n/a',
        cph: 'n/a',
        checkpoint: 'mock_app_insights_cloud_role',
        status: 'success',
        action: {
          type: telemetryEvent.REGISTRATION_OF_INTEREST,
          message: 'The customer has been put on the waiting list',
          data: {
            businessEmail: testCase.given.businessEmail,
            accessGranted: false,
            accessGrantedAt: 'n/a',
            createdAt: MOCK_NOW
          },
          raisedBy: testCase.given.businessEmail
        }
      }
    })
  })
})
