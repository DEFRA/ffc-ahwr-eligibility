
jest.mock('../../../../../app/auto-eligibility/processing/check-eligibility')
const checkEligibility = require('../../../../../app/auto-eligibility/processing/check-eligibility')
jest.mock('../../../../../app/auto-eligibility/processing/update-waiting')
const updateWaiting = require('../../../../../app/auto-eligibility/processing/update-waiting')
jest.mock('../../../../../app/auto-eligibility/processing/process-ineligible')
const processIneligible = require('../../../../../app/auto-eligibility/processing/process-ineligible')

const processRegisterYourInterestMessage = require('../../../../../app/register-your-interest/messaging/process-message')

describe(('Consume register your interest message tests'), () => {
  test('successfully fetched register your interest message', async () => {
    checkEligibility.mockResolvedValue(undefined)
    updateWaiting.mockResolvedValue(undefined)
    processIneligible.mockResolvedValue(undefined)
    const message = { body: { foo: 'bar' } }
    const logSpy = jest.spyOn(console, 'log')
    await processRegisterYourInterestMessage(message)
    expect(logSpy).toHaveBeenCalledWith('Reading message from queue with body {"foo":"bar"}')
  })
})
