
jest.mock('../../../../../app/eligibility/check-eligibility')
const checkEligibility = require('../../../../../app/eligibility/check-eligibility')
jest.mock('../../../../../app/eligibility/update-waiting')
const updateWaiting = require('../../../../../app/eligibility/update-waiting')
jest.mock('../../../../../app/eligibility/process-un-eligible')
const processUnEligible = require('../../../../../app/eligibility/process-un-eligible')

const processRegisterYourInterestMessage = require('../../../../../app/register-your-interest/messaging/process-message')

describe(('Consume register your interest message tests'), () => {
  test('successfully fetched register your interest message', async () => {
    checkEligibility.mockResolvedValue(undefined)
    updateWaiting.mockResolvedValue(undefined)
    processUnEligible.mockResolvedValue(undefined)
    const message = { body: { foo: 'bar' } }
    const logSpy = jest.spyOn(console, 'log')
    await processRegisterYourInterestMessage(message)
    expect(logSpy).toHaveBeenCalledWith('Reading message from queue with body {"foo":"bar"}')
  })
})
