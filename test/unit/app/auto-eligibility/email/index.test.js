describe('Send email test', () => {
  let mockSendEmail
  let autoEligibilityEmail
  const mockNotifyConfig = { apiKey: 'someKey' }
  const mockAutoEligibilityConfig = { emailTemplates: { waitingList: 'waitingListTemplateId', genericIneligible: 'ineligbleTemplateId', applyServiceInvite: 'applyServiceInviteTemplateId' } }

  beforeAll(() => {
    mockSendEmail = require('../../../../../app/lib/send-email')
    jest.mock('../../../../../app/lib/send-email')
    autoEligibilityEmail = require('../../../../../app/auto-eligibility/email')
    jest.mock('../../../../../app/config/notify', () => mockNotifyConfig)
    require('../../../../../app/config/notify')
    jest.mock('../../../../../app/auto-eligibility/config', () => mockAutoEligibilityConfig)
    require('../../../../../app/auto-eligibility/config')
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
