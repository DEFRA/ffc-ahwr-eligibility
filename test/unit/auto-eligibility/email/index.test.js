describe('Send email test', () => {
  let mockSendEmail
  let autoEligibilityEmail
  const mockNotifyConfig = { apiKey: 'someKey' }
  const mockAutoEligibilityConfig = {
    emailNotifier: {
      emailTemplateIds: {
        waitingList: 'waitingListTemplateId',
        applyServiceInvite: 'applyServiceInviteTemplateId'
      },
      applyService: {
        uri: 'http://localhost:3000/apply',
        vetGuidance: 'http://localhost:3000/apply/vet-guidance'
      }
    }
  }

  beforeAll(() => {
    jest.mock('../../../../app/notify/send-email')
    jest.mock('../../../../app/config/notify', () => mockNotifyConfig)
    jest.mock('../../../../app/auto-eligibility/config', () => mockAutoEligibilityConfig)
    require('../../../../app/config/notify')
    autoEligibilityEmail = require('../../../../app/auto-eligibility/email-notifier')
    mockSendEmail = require('../../../../app/notify/send-email')
    require('../../../../app/auto-eligibility/config')
  })

  test('Send waiting list email', async () => {
    await autoEligibilityEmail.sendWaitingListEmail('email@email.com')
    expect(mockSendEmail).toHaveBeenCalledWith(
      'waitingListTemplateId',
      'email@email.com'
    )
  })

  test('Send invite to apply guidance email', async () => {
    await autoEligibilityEmail.sendApplyGuidanceEmail('email@email.com')
    expect(mockSendEmail).toHaveBeenCalledWith(
      'applyServiceInviteTemplateId',
      'email@email.com',
      {
        personalisation: {
          applyGuidanceUrl: 'http://localhost:3000/apply',
          applyVetGuidanceUrl: 'http://localhost:3000/apply/vet-guidance'
        }
      }
    )
  })
})
