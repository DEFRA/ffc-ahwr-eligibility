const MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION = '7a0ce567-d908-4f35-a858-de9e8f5445ec'
const MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS = 'eat@email.com'

describe('Process ineligible customer', () => {
  let logSpy
  let notifyClient
  let processIneligibleCustomer

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

    processIneligibleCustomer = require('../../../../../app/auto-eligibility/processing/process-ineligible-customer')

    logSpy = jest.spyOn(console, 'log')
  })

  afterAll(() => {
    jest.resetModules()
  })

  test.each([
    {
      toString: () => 'given a customer\'s sbi is already registered',
      given: {
        customer: {
          sbi: 123456789,
          crn: '1234567890',
          businessEmail: 'business@email.com',
          sbiAlreadyRegistered: () => true
        }
      },
      expect: {
        emailNotifier: {
          emailTemplateId: MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION,
          emailAddressTo: MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS
        },
        consoleLogs: [
          `Processing ineligible customer: ${JSON.stringify({
            sbi: 123456789,
            crn: '1234567890',
            businessEmail: 'business@email.com'
          })}`,
          `Attempting to send email with template ID ${MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION} to email ${MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS}`,
          `Successfully sent email with template ID ${MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION} to email ${MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS}`
        ]
      }
    },
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
  })
})
