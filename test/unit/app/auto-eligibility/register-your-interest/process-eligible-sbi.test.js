const { fn, col } = require('sequelize')

const MOCK_NOW = new Date()

const MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID = '9d9fb4dc-93f8-44b0-be28-a53524535db7'
const MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION = '7a0ce567-d908-4f35-a858-de9e8f5445ec'
const MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS = 'eat@email.com'

describe('Process eligible SBI', () => {
  let logSpy
  let db
  let notifyClient
  let processEligibleCustomer

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
      emailNotifier: {
        emailTemplateIds: {
          waitingList: MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID,
          ineligibleApplication: MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION
        },
        earlyAdoptionTeam: {
          emailAddress: MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
        }
      }
    }))

    processEligibleCustomer = require('../../../../../app/auto-eligibility/register-your-interest/process-eligible-sbi')

    logSpy = jest.spyOn(console, 'log')
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
      toString: () => 'given a customer\'s business email has multiple distinct sbi',
      given: {
        customer: {
          sbi: 123456789,
          crn: '1234567890',
          businessEmail: 'business@email.com',
          businessEmailHasMultipleDistinctSbi: () => true
        }
      },
      expect: {
        emailNotifier: {
          emailTemplateId: MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION,
          emailAddressTo: MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
        },
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing eligible SBI: ${JSON.stringify({
            sbi: 123456789,
            crn: '1234567890',
            businessEmail: 'business@email.com'
          })}`,
          `${MOCK_NOW.toISOString()} The customer's business email has multiple distinct SBI`,
          `Attempting to send email with template ID ${MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION} to email ${MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS}`,
          `Successfully sent email with template ID ${MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION} to email ${MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS}`
        ]
      }
    },
    {
      toString: () => 'given a customer ready to be moved to the waiting list',
      given: {
        customer: {
          sbi: 123456789,
          crn: '1234567890',
          businessEmail: 'business@email.com',
          businessEmailHasMultipleDistinctSbi: () => false,
          alreadyOnWaitingList: () => false
        }
      },
      expect: {
        db: {
          now: MOCK_NOW
        },
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing eligible SBI: ${JSON.stringify({
            sbi: 123456789,
            crn: '1234567890',
            businessEmail: 'business@email.com'
          })}`,
          `${MOCK_NOW.toISOString()} Updating waiting updated at: ${JSON.stringify({
            sbi: 123456789,
            crn: '1234567890'
          })}`,
          `Attempting to send email with template ID ${MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID} to email business@email.com`,
          `Successfully sent email with template ID ${MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID} to email business@email.com`
        ]
      }
    }
  ])('%s', async (testCase) => {
    await processEligibleCustomer(testCase.given.customer)

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    if (typeof testCase.expect.db !== 'undefined') {
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
    }
    if (typeof testCase.expect.emailNotifier !== 'undefined') {
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        testCase.expect.emailNotifier.emailTemplateId,
        testCase.expect.emailNotifier.emailAddressTo,
        {
          personalisation: {
            sbi: testCase.given.customer.sbi,
            crn: testCase.given.customer.crn,
            businessEmail: testCase.given.customer.businessEmail
          }
        }
      )
    }
  })
})
