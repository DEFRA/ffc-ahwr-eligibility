
const { when, resetAllWhenMocks } = require('jest-when')

describe('Process register your interest message', () => {
  let logSpy
  let checkEligibility
  let processEligible
  let processIneligible
  let processRegisterYourInterestRequest

  beforeAll(() => {
    logSpy = jest.spyOn(console, 'log')

    jest.mock('../../../../../app/config/notify', () => ({
      apiKey: 'mockApiKey'
    }))

    jest.mock('../../../../../app/auto-eligibility/processing/check-eligibility')
    checkEligibility = require('../../../../../app/auto-eligibility/processing/check-eligibility')

    jest.mock('../../../../../app/auto-eligibility/processing/process-eligible')
    processEligible = require('../../../../../app/auto-eligibility/processing/process-eligible')

    jest.mock('../../../../../app/auto-eligibility/processing/process-ineligible')
    processIneligible = require('../../../../../app/auto-eligibility/processing/process-ineligible')

    processRegisterYourInterestRequest = require('../../../../../app/register-your-interest/messaging/process-register-your-interest-request')
  })

  afterAll(() => {
    resetAllWhenMocks()
    jest.resetModules()
  })

  test('process register your interest request as eligible', async () => {
    const request = {
      sbi: 123456789,
      crn: '1234567890',
      email: 'name@email.com'
    }
    when(checkEligibility)
      .calledWith(
        request.sbi,
        request.crn,
        request.email
      )
      .mockResolvedValue({ waiting_updated_at: '2022-12-29 11:35:00', access_granted: false })

    await processRegisterYourInterestRequest(request)

    expect(logSpy).toHaveBeenCalledWith(`Processing register your interest request: ${JSON.stringify(request)}`)
    expect(processEligible).toHaveBeenCalledWith(
      request.sbi,
      request.crn,
      request.email,
      '2022-12-29 11:35:00',
      false
    )
  })

  test('process register your interest request as ineligible', async () => {
    const request = {
      sbi: 123456789,
      crn: '1234567890',
      email: 'name@email.com'
    }
    when(checkEligibility)
      .calledWith(
        request.sbi,
        request.crn,
        request.email
      )
      .mockResolvedValue(undefined)

    await processRegisterYourInterestRequest(request)

    expect(logSpy).toHaveBeenCalledWith(`Processing register your interest request: ${JSON.stringify(request)}`)
    expect(processIneligible).toHaveBeenCalledWith(
      request.sbi,
      request.crn,
      request.email
    )
  })

  test('process a corrupted register your interest request', async () => {
    const request = {
      sbi: 123456789,
      crn: '1234567890',
      email: 'wrong_email'
    }

    expect(
      async () => { await processRegisterYourInterestRequest(request) }
    ).rejects.toThrowError('ValidationError: "email" must be a valid email')
  })
})
