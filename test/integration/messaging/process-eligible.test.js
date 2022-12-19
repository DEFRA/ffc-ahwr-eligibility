jest.mock('../../../app/auto-eligibility/processing/update-waiting')
const updateWaiting = require('../../../app/auto-eligibility/processing/update-waiting')
const processEligible = require('../../../app/auto-eligibility/processing/process-eligible')
const SBI = require('../../mock-components/mock-sbi')
const CRN = require('../../mock-components/mock-crn')

describe(('Consume register your interest message tests'), () => {
  test('ensure that updateWaiting is called with sbi and crn when processEligible is called with sbi and crn', async () => {
    await processEligible(SBI, CRN)
    expect(updateWaiting).toHaveBeenCalledWith(SBI, CRN)
  })
})
