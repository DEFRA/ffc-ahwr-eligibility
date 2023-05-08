const { when, resetAllWhenMocks } = require('jest-when')
const { fn, col, where } = require('sequelize')
const telemetryEvent = require('../../../../app/auto-eligibility/telemetry/telemetry-event')
const mockConfig = require('../../../../app/auto-eligibility/config')

const MOCK_SEND_EVENT = jest.fn()
const MOCK_NOW = new Date()

describe('check unique registration', () => {
  let logSpy
  let db
  let checkUniqueRegistrationOfInterest

  beforeAll(async () => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../app/data')
    db = require('../../../../app/data')

    jest.mock('../../../../app/auto-eligibility/config', () => ({
      ...mockConfig,
      defraId: {
        enabled: true
      }
    }))

    jest.mock('../../../../app/app-insights/app-insights.config', () => ({
      appInsightsCloudRole: 'mock_app_insights_cloud_role'
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

    checkUniqueRegistrationOfInterest = require('../../../../app/auto-eligibility/register-your-interest/check-unique-registration-of-interest')

    logSpy = jest.spyOn(console, 'log')
  })

  afterAll(async () => {
    resetAllWhenMocks()
    jest.resetModules()
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    {
      toString: () => 'when no customers were found',
      given: {
        businessEmail: 'business@email.com'
      },
      when: {
        customers: []
      },
      expect: {
        isUnique: true,
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Checking unique registration: ${JSON.stringify({ businessEmail: 'business@email.com' })}`,
          `${MOCK_NOW.toISOString()} Finding all by business_email: ${JSON.stringify({ businessEmail: 'business@email.com' })}`,
          `${MOCK_NOW.toISOString()} Found customers: ${JSON.stringify([])}`,
          `${MOCK_NOW.toISOString()} Email is unique: ${JSON.stringify({ businessEmail: 'business@email.com' })}`
        ]
      }
    },
    {
      toString: () => 'when customer was found',
      given: {
        businessEmail: 'business@email.com'
      },
      when: {
        customers: [
          {
            business_email: 'business@email.com',
            created_at: MOCK_NOW,
            access_granted: true,
            access_granted_at: MOCK_NOW
          }
        ]
      },
      expect: {
        isUnique: false,
        consoleLogs: [
            `${MOCK_NOW.toISOString()} Checking unique registration: ${JSON.stringify({ businessEmail: 'business@email.com' })}`,
            `${MOCK_NOW.toISOString()} Finding all by business_email: ${JSON.stringify({ businessEmail: 'business@email.com' })}`,
            `${MOCK_NOW.toISOString()} Found customers: ${JSON.stringify([{
              business_email: 'business@email.com',
              created_at: MOCK_NOW,
              access_granted: true,
              access_granted_at: MOCK_NOW
            }])}`,
            `${MOCK_NOW.toISOString()} Email already registered: ${JSON.stringify({
              customers: [{
                business_email: 'business@email.com',
                created_at: MOCK_NOW,
                access_granted: true,
                access_granted_at: MOCK_NOW
              }]
           })}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    when(db.waiting_list.findAll)
      .calledWith({
        attributes: [
          [fn('LOWER', col('business_email')), 'business_email'],
          'created_at',
          'access_granted',
          'access_granted_at'
        ],
        where: {
          business_email: where(fn('LOWER', col('business_email')), testCase.given.businessEmail)
        }
      })
      .mockResolvedValue(testCase.when.customers)

    const isUnique = await checkUniqueRegistrationOfInterest(
      testCase.given.businessEmail
    )

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(isUnique).toEqual(testCase.expect.isUnique)
    if (testCase.expect.isUnique) {
      expect(MOCK_SEND_EVENT).toHaveBeenCalledTimes(0)
    } else {
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
            type: telemetryEvent.DUPLICATE_SUBMISSION,
            message: 'The email address has already been submitted',
            data: {
              businessEmail: testCase.given.businessEmail,
              accessGranted: true,
              accessGrantedAt: MOCK_NOW,
              createdAt: MOCK_NOW
            },
            raisedBy: testCase.given.businessEmail
          }
        }
      })
    }
  })
})
