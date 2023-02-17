const { fn, col } = require('sequelize')

const MOCK_NOW = new Date()

const MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID = '9d9fb4dc-93f8-44b0-be28-a53524535db7'
const MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION = '7a0ce567-d908-4f35-a858-de9e8f5445ec'
const MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS = 'eat@email.com'

describe('Process eligible SBI', () => {
  let logSpy
  let db
  let processEligibleCustomer
  let raiseEvent

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

    jest.mock('../../../../app/event/raise-event')
    raiseEvent = require('../../../../app/event/raise-event')

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
        [fn('LOWER', col('business_email')), 'business_email'],
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
    expect(raiseEvent).toHaveBeenCalledTimes(1)
    expect(raiseEvent).toHaveBeenCalledWith({
      name: 'send-session-event',
      properties: {
        id: `${testCase.given.customer.sbi}_${testCase.given.customer.crn}`,
        sbi: testCase.given.customer.sbi,
        cph: 'n/a',
        checkpoint: 'mock_app_insights_cloud_role',
        action: {
          type: 'put_on_the_waiting_list',
          message: 'The customer has been put on the waiting list',
          data: {
            sbi: testCase.given.customer.sbi,
            crn: testCase.given.customer.crn,
            businessEmail: testCase.given.customer.businessEmail
          },
          raisedOn: MOCK_NOW,
          raisedBy: testCase.given.customer.businessEmail
        }
      }
    })
  })
})
