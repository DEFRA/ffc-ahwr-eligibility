jest.mock('../../../app/auto-eligibility/processing/update-waiting')
jest.mock('../../../app/auto-eligibility/email-notifier', () => {
  return {
    sendWaitingListEmail: jest.fn()
  }
})
jest.mock('../../../app/auto-eligibility/config', () => {})
const updateWaiting = require('../../../app/auto-eligibility/processing/update-waiting')
const emailNotifier = require('../../../app/auto-eligibility/email-notifier')
const processEligible = require('../../../app/auto-eligibility/processing/process-eligible-customer')
const SBI = require('../../mock-components/mock-sbi')
const CRN = require('../../mock-components/mock-crn')
const EMAIL = require('../../mock-components/mock-business-email')

describe(('Test processEligble function'), () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('ensure that updateWaiting is called with sbi, crn and email when processEligible is called with sbi, crn and email', async () => {
    await processEligible(SBI, CRN, EMAIL, null, false)
    expect(updateWaiting).toHaveBeenCalledWith(SBI, CRN)
    expect(emailNotifier.sendWaitingListEmail).toHaveBeenCalledWith(EMAIL)
  })

  test('ensure that updateWaiting and send waiting list NOT called', async () => {
    await processEligible(SBI, CRN, EMAIL, '2022-12-29 11:35:00', false)
    expect(updateWaiting).not.toHaveBeenCalled()
    expect(emailNotifier.sendWaitingListEmail).not.toHaveBeenCalled()
  })
})
