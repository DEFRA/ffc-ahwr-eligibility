jest.mock('../../../app/auto-eligibility/processing/check-eligibility')
const checkEligibility = require('../../../app/auto-eligibility/processing/check-eligibility')
jest.mock('../../../app/auto-eligibility/processing/process-ineligible')
const processIneligible = require('../../../app/auto-eligibility/processing/process-ineligible')
jest.mock('../../../app/auto-eligibility/processing/process-eligible')
const processEligible = require('../../../app/auto-eligibility/processing/process-eligible')

const NON_WAITING_ELIGIBILITY = JSON.parse(JSON.stringify(require('../../mock-components/mock-eligibility').nonWaitingEligibility))
const INTEREST_REQUEST = JSON.parse(JSON.stringify(require('../../mock-components/mock-interest-request')))

const processRegisterYourInterestMessage = require('../../../app/register-your-interest/messaging/process-message')

describe(('Consume register your interest message tests'), () => {
  test('ensure that processEligibile is called with sbi and crn when checkEligibility returns record', async () => {
    checkEligibility.mockResolvedValue(NON_WAITING_ELIGIBILITY)
    const message = { body: INTEREST_REQUEST }
    await processRegisterYourInterestMessage(message)
    expect(processEligible).toHaveBeenCalledWith(message.body.sbi, message.body.crn)
  })

  test('ensure that processInligible is called when checkEligibility returns null', async () => {
    checkEligibility.mockResolvedValue(null)
    const message = { body: INTEREST_REQUEST }
    await processRegisterYourInterestMessage(message)
    expect(processIneligible).toHaveBeenCalled()
  })
})
