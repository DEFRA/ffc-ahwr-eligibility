jest.mock('../../../app/auto-eligibility/processing/update-waiting')
jest.mock('../../../app/auto-eligibility/email', () => {
  return {
    sendWaitingListEmail: jest.fn()
  }
})
const updateWaiting = require('../../../app/auto-eligibility/processing/update-waiting')
const emailNotifier = require('../../../app/auto-eligibility/email')
const processEligible = require('../../../app/auto-eligibility/processing/process-eligible')
const SBI = require('../../mock-components/mock-sbi')
const CRN = require('../../mock-components/mock-crn')
const EMAIL = require('../../mock-components/mock-business-email')

describe(('Consume register your interest message tests'), () => {
  test('ensure that updateWaiting is called with sbi, crn and email when processEligible is called with sbi, crn and email', async () => {
    await processEligible(SBI, CRN, EMAIL)
    expect(updateWaiting).toHaveBeenCalledWith(SBI, CRN)
    expect(emailNotifier.sendWaitingListEmail).toHaveBeenCalledWith(EMAIL)
  })
})
