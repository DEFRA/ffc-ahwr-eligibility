const MOCK_NOW = new Date()

const MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID = '9d9fb4dc-93f8-44b0-be28-a53524535db7'
const MOCK_NOTIFY_TEMPLATE_ID_INELIGIBLE_APPLICATION = '7a0ce567-d908-4f35-a858-de9e8f5445ec'
const MOCK_NOTIFY_EARLY_ADOPTION_TEAM_EMAIL_ADDRESS = 'eat@email.com'
const MOCK_SBI = 123456789
const MOCK_CRN = '1234567890'
const MOCK_BUSINESS_EMAIL = 'business@email.com'

describe('Process eligble sbi feature toggle on', () => {
  let logSpy
  let notifyClient
  let processEligibleCustomer

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../app/data')
    jest.mock('../../../../app/notify/notify-client')
    jest.mock('../../../../app/config/notify', () => ({
      apiKey: 'mockApiKey'
    }))
    notifyClient = require('../../../../app/notify/notify-client')

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
      given: {
        customer: {
          sbi: MOCK_SBI,
          crn: MOCK_CRN,
          businessEmail: MOCK_BUSINESS_EMAIL,
          businessEmailHasMultipleDistinctSbi: () => true
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
        emailNotifier: {
          emailTemplateId: MOCK_WAITING_LIST_EMAIL_TEMPLATE_ID,
          emailAddressTo: MOCK_BUSINESS_EMAIL
        },
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing eligible SBI: ${JSON.stringify({
            customer: {
              sbi: MOCK_SBI,
              crn: MOCK_CRN,
              businessEmail: MOCK_BUSINESS_EMAIL
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
  })
})
