const telemetryEvent = require('../../../../app/auto-eligibility/telemetry/telemetry-event')

const MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION = '7a0ce567-d908-4f35-a858-de9e8f5445ec'
const MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS = 'eat@email.com'

const MOCK_NOW = new Date()

describe('Process ineligible SBI', () => {
  let logSpy
  let notifyClient
  let processIneligibleCustomer
  const MOCK_SEND_EVENT = jest.fn()

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

    processIneligibleCustomer = require('../../../../app/auto-eligibility/register-your-interest/process-ineligible-sbi')

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
      toString: () => 'an ineligible customer - no match against data warehouse',
      given: {
        customer: {
          sbi: '123456789',
          crn: '1234567890',
          businessEmail: 'business@email.com',
          sbiAlreadyRegistered: false
        }
      },
      expect: {
        emailNotifier: {
          emailTemplateId: MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION,
          emailAddressTo: MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
        },
        telemetryEvent: telemetryEvent.NO_MATCH,
        reasonForIneligible: 'No match against data warehouse',
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing ineligible SBI: ${JSON.stringify({
            sbi: '123456789',
            crn: '1234567890',
            businessEmail: 'business@email.com',
            sbiAlreadyRegistered: false
          })}`,
          `${MOCK_NOW.toISOString()} Attempting to send email with template ID ${MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION} to email ${MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS}`,
          `${MOCK_NOW.toISOString()} Successfully sent email with template ID ${MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION} to email ${MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS}`
        ]
      }
    },
    {
      toString: () => 'an ineligible customer - duplicate submission',
      given: {
        customer: {
          sbi: '123456789',
          crn: '1234567890',
          businessEmail: 'business@email.com',
          sbiAlreadyRegistered: true
        }
      },
      expect: {
        emailNotifier: {
          emailTemplateId: MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION,
          emailAddressTo: MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
        },
        telemetryEvent: telemetryEvent.DUPLICATE_SUBMISSION,
        reasonForIneligible: 'Duplicate submission',
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing ineligible SBI: ${JSON.stringify({
            sbi: '123456789',
            crn: '1234567890',
            businessEmail: 'business@email.com',
            sbiAlreadyRegistered: true
          })}`,
          `${MOCK_NOW.toISOString()} Attempting to send email with template ID ${MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION} to email ${MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS}`,
          `${MOCK_NOW.toISOString()} Successfully sent email with template ID ${MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION} to email ${MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    await processIneligibleCustomer(testCase.given.customer)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(notifyClient.sendEmail).toHaveBeenCalledWith(
      MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION,
      MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS,
      {
        personalisation: {
          sbi: testCase.given.customer.sbi,
          crn: testCase.given.customer.crn,
          businessEmail: testCase.given.customer.businessEmail
        }
      }
    )
    expect(MOCK_SEND_EVENT).toHaveBeenCalledTimes(1)
    expect(MOCK_SEND_EVENT).toHaveBeenCalledWith({
      name: 'send-session-event',
      properties: {
        id: `${testCase.given.customer.sbi}_${testCase.given.customer.crn}`,
        sbi: testCase.given.customer.sbi,
        cph: 'n/a',
        checkpoint: 'mock_app_insights_cloud_role',
        status: 'success',
        action: {
          type: testCase.expect.telemetryEvent,
          message: 'The customer has been recognised as ineligible',
          data: {
            sbi: testCase.given.customer.sbi,
            crn: testCase.given.customer.crn,
            businessEmail: testCase.given.customer.businessEmail,
            interestRegisteredAt: MOCK_NOW,
            onWaitingList: false,
            waitingUpdatedAt: 'n/a',
            eligible: false,
            ineligibleReason: testCase.expect.reasonForIneligible,
            accessGranted: false,
            accessGrantedAt: 'n/a'
          },
          raisedBy: 'business@email.com'
        }
      }
    })
  })
})
