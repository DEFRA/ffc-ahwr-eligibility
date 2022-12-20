describe('Send email test', () => {
  let mockSendEmail
  let autoEligibilityEmail
  const mockNotifyConfig = { apiKey: 'someKey' }
  const mockAutoEligibilityConfig = {
    earlyAdoptionTeam: {
      emailAddress: 'eat@email.com'
    },
    emailTemplateIds: {
      ineligibleApplication: 'ineligibleApplication',
      waitingList: 'waitingListTemplateId',
      genericIneligible: 'ineligbleTemplateId',
      applyServiceInvite: 'applyServiceInviteTemplateId'
    }
  }

  beforeAll(() => {
    mockSendEmail = require('../../../../../app/lib/send-email')
    jest.mock('../../../../../app/lib/send-email')
    autoEligibilityEmail = require('../../../../../app/auto-eligibility/email-notifier')
    jest.mock('../../../../../app/config/notify', () => mockNotifyConfig)
    require('../../../../../app/config/notify')
    jest.mock('../../../../../app/auto-eligibility/config', () => mockAutoEligibilityConfig)
    require('../../../../../app/auto-eligibility/config')
  })

  test('Send ineligibility application email', async () => {
    const sbi = 123456789
    const crn = '1234567890'
    const businessEmail = 'business@email.com'

    await autoEligibilityEmail.sendIneligibleApplicationEmail({
      sbi,
      crn,
      businessEmail
    })

    expect(mockSendEmail).toHaveBeenCalledWith(
      'ineligibleApplication',
      'eat@email.com',
      {
        sbi,
        crn,
        businessEmail
      }
    )
  })

  test('Send waiting list email', async () => {
    await autoEligibilityEmail.sendWaitingListEmail('email@email.com')
    expect(mockSendEmail).toHaveBeenCalledWith(
      'waitingListTemplateId',
      'email@email.com'
    )
  })

  test('Send ineligible email', async () => {
    await autoEligibilityEmail.sendIneligibleEmail('email@email.com')
    expect(mockSendEmail).toHaveBeenCalledWith(
      'ineligbleTemplateId',
      'email@email.com'
    )
  })

  test('Send invite to apply guidance email', async () => {
    await autoEligibilityEmail.sendApplyGuidanceEmail('email@email.com', 'https://localhost:3000/apply')
    expect(mockSendEmail).toHaveBeenCalledWith(
      'applyServiceInviteTemplateId',
      'email@email.com',
      {
        personalisation: {
          applyGuidanceUrl: 'https://localhost:3000/apply'
        }
      }
    )
  })
})
