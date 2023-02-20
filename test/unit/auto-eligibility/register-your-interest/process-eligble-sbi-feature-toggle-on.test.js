const { when, resetAllWhenMocks } = require('jest-when')
const { fn, col } = require('sequelize')
const telemetryEvent = require('../../../../app/auto-eligibility/telemetry/telemetry-event')

const MOCK_NOW = new Date()

const MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID = '9d9fb4dc-93f8-44b0-be28-a53524535db7'
const MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION = '7a0ce567-d908-4f35-a858-de9e8f5445ec'
const MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS = 'eat@email.com'
const MOCK_SBI = '123456789'
const MOCK_CRN = '1234567890'
const MOCK_BUSINESS_EMAIL = 'business@email.com'

describe('Process eligble sbi feature toggle on', () => {
  let db
  let logSpy
  let notifyClient
  let processEligibleCustomer
  const MOCK_SEND_EVENT = jest.fn()

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../app/app-insights/app-insights.config', () => ({
      appInsightsCloudRole: 'mock_app_insights_cloud_role'
    }))
    jest.mock('../../../../app/data')
    jest.mock('../../../../app/notify/notify-client')
    jest.mock('../../../../app/config/notify', () => ({
      apiKey: 'mockApiKey'
    }))
    notifyClient = require('../../../../app/notify/notify-client')

    jest.mock('../../../../app/data')
    db = require('../../../../app/data')

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
  })

  afterAll(() => {
    jest.useRealTimers()
    jest.resetModules()
    resetAllWhenMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  test.each([
    {
      given: {
        customer: {
          sbi: MOCK_SBI,
          crn: MOCK_CRN,
          businessEmail: MOCK_BUSINESS_EMAIL,
          businessEmailHasMultipleDistinctSbi: true
        }
      },
      when: {
        config: {
          selectYourBusiness: {
            enabled: true
          }
        }
      },
      expect: {
        db: {
          now: MOCK_NOW
        },
        emailNotifier: {
          emailTemplateId: MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID,
          emailAddressTo: MOCK_BUSINESS_EMAIL
        },
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing eligible SBI: ${JSON.stringify({
            customer: {
              sbi: MOCK_SBI,
              crn: MOCK_CRN,
              businessEmail: MOCK_BUSINESS_EMAIL,
              businessEmailHasMultipleDistinctSbi: true
            },
            selectYourBusinessEnabled: true
          })}`,
          `${MOCK_NOW.toISOString()} Updating waiting updated at: ${JSON.stringify({ sbi: MOCK_SBI, crn: MOCK_CRN })}`,
          `${MOCK_NOW.toISOString()} Attempting to send email with template ID ${MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID} to email ${MOCK_BUSINESS_EMAIL}`,
          `${MOCK_NOW.toISOString()} Successfully sent email with template ID ${MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID} to email ${MOCK_BUSINESS_EMAIL}`
        ]
      }
    }
  ])('Checks for multiple SBI linked to an email', async (testCase) => {
    jest.isolateModules(async () => {
      const mockEnabled = testCase.when.config.selectYourBusiness.enabled
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
          enabled: mockEnabled
        }
      }))
    })
    when(db.customer.update).calledWith({
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
        ['waiting_updated_at', 'waitingUpdatedAt'],
        'access_granted'
      ],
      where: {
        sbi: testCase.given.customer.sbi,
        crn: testCase.given.customer.crn
      }
    }).mockResolvedValue({
      sbi: testCase.given.customer.sbi,
      crn: testCase.given.customer.crn,
      businessEmail: testCase.given.customer.businessEmail,
      waitingUpdatedAt: MOCK_NOW
    })

    processEligibleCustomer = require('../../../../app/auto-eligibility/register-your-interest/process-eligible-sbi')
    await processEligibleCustomer(testCase.given.customer)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )

    expect(notifyClient.sendEmail).toHaveBeenCalledWith(
      testCase.expect.emailNotifier.emailTemplateId,
      testCase.expect.emailNotifier.emailAddressTo,
      undefined
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
          type: telemetryEvent.PUT_ON_THE_WAITING_LIST,
          message: 'The customer has been put on the waiting list',
          data: {
            sbi: testCase.given.customer.sbi,
            crn: testCase.given.customer.crn,
            businessEmail: testCase.given.customer.businessEmail,
            eligible: true,
            ineligibleReason: 'n/a',
            onWaitingList: true,
            waitingUpdatedAt: MOCK_NOW,
            accessGranted: false,
            accessGrantedAt: 'n/a'
          },
          raisedOn: MOCK_NOW,
          raisedBy: testCase.given.customer.businessEmail
        }
      }
    })
  })
})
