const { fn, col } = require('sequelize')
const telemetryEvent = require('../../../../app/auto-eligibility/telemetry/telemetry-event')

const MOCK_NOW = new Date()

const MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID = '9d9fb4dc-93f8-44b0-be28-a53524535db7'
const MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION = '7a0ce567-d908-4f35-a858-de9e8f5445ec'
const MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS = 'eat@email.com'

describe('Process eligible SBI', () => {
  let logSpy
  let db
  let processEligibleCustomer
  const MOCK_SEND_EVENT = jest.fn()

  beforeAll(() => {
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
      selectYourBusiness: {
        enabled: false
      }
    }))
    jest.mock('../../../../app/notify/notify-client')

    logSpy = jest.spyOn(console, 'log')

    jest.mock('ffc-ahwr-event-publisher', () => {
      return {
        PublishEvent: jest.fn().mockImplementation(() => {
          return {
            sendEvent: MOCK_SEND_EVENT
          }
        })
      }
    })

    jest.mock('../../../../app/data')
    db = require('../../../../app/data')

    processEligibleCustomer = require('../../../../app/auto-eligibility/register-your-interest/process-eligible-sbi')
  })

  afterAll(() => {
    jest.useRealTimers()
    jest.resetModules()
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  test.each([
    {
      toString: () => 'given a customer ready to be moved to the waiting list',
      given: {
        customer: {
          sbi: '123456789',
          crn: '1234567890',
          businessEmail: 'business@email.com',
          businessEmailHasMultipleDistinctSbi: false
        }
      },
      expect: {
        db: {
          now: MOCK_NOW
        },
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing eligible SBI: ${JSON.stringify({
            customer: {
              sbi: '123456789',
              crn: '1234567890',
              businessEmail: 'business@email.com',
              businessEmailHasMultipleDistinctSbi: false
            },
            selectYourBusinessEnabled: false
          })}`,
          `${MOCK_NOW.toISOString()} Updating waiting updated at: ${JSON.stringify({
            sbi: '123456789',
            crn: '1234567890'
          })}`,
          `${MOCK_NOW.toISOString()} Attempting to send email with template ID ${MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID} to email business@email.com`,
          `${MOCK_NOW.toISOString()} Successfully sent email with template ID ${MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID} to email business@email.com`
        ]
      }
    }
  ])('%s', async (testCase) => {
    await processEligibleCustomer(testCase.given.customer)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(db.customer.update).toHaveBeenCalledTimes(1)
    expect(db.customer.update).toHaveBeenCalledWith({
      last_updated_at: testCase.expect.db.now,
      waiting_updated_at: testCase.expect.db.now
    }, {
      lock: true,
      attributes: [
        'sbi',
        'crn',
        'customer_name',
        'business_name',
        [fn('LOWER', col('business_email')), 'businessEmail'],
        'business_address',
        'last_updated_at',
        'waiting_updated_at',
        'access_granted'
      ],
      where: {
        sbi: testCase.given.customer.sbi,
        crn: testCase.given.customer.crn
      }
    })
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
          type: telemetryEvent.REGISTRATION_OF_INTEREST,
          message: 'The customer has been put on the waiting list',
          data: {
            sbi: testCase.given.customer.sbi,
            crn: testCase.given.customer.crn,
            businessEmail: testCase.given.customer.businessEmail,
            interestRegisteredAt: MOCK_NOW,
            eligible: true,
            ineligibleReason: 'n/a',
            onWaitingList: true,
            waitingUpdatedAt: MOCK_NOW,
            accessGranted: false,
            accessGrantedAt: 'n/a'
          },
          raisedBy: testCase.given.customer.businessEmail
        }
      }
    })
  })
})
