jest.mock('../../../app/eligibility/check-eligibility')
const checkEligibility = require('../../../app/eligibility/check-eligibility')
jest.mock('../../../app/eligibility/update-waiting')
const updateWaiting = require('../../../app/eligibility/update-waiting')
jest.mock('../../../app/eligibility/process-un-eligible')
const processUnEligible = require('../../../app/eligibility/process-un-eligible')

const NON_WAITING_ELIGIBILITY = JSON.parse(JSON.stringify(require('../../mock-components/mock-eligibility').nonWaitingEligibility))
const INTEREST_REQUEST = JSON.parse(JSON.stringify(require('../../mock-components/mock-interest-request')))

const processRegisterYourInterestMessage = require('../../../app/register-your-interest/messaging/process-message')

describe(('Consume register your interest message tests'), () => {
  test('ensure that updateWaiting is called when checkEligibility returns record', async () => {
    checkEligibility.mockResolvedValue(NON_WAITING_ELIGIBILITY)
    const message = { body: INTEREST_REQUEST }
    await processRegisterYourInterestMessage(message)
    expect(updateWaiting).toHaveBeenCalled()
  })

  test('ensure that updateWaiting is called with sbi and crn when checkEligibility returns record', async () => {
    checkEligibility.mockResolvedValue(NON_WAITING_ELIGIBILITY)
    const message = { body: INTEREST_REQUEST }
    await processRegisterYourInterestMessage(message)
    expect(updateWaiting).toHaveBeenCalledWith(message.body.sbi, message.body.crn)
  })

  test('ensure that processUnEligible is called when checkEligibility returns null', async () => {
    checkEligibility.mockResolvedValue(null)
    const message = { body: INTEREST_REQUEST }
    await processRegisterYourInterestMessage(message)
    expect(processUnEligible).toHaveBeenCalled()
  })
})
