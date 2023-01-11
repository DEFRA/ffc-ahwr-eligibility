
const { when, resetAllWhenMocks } = require('jest-when')

describe('Process register your interest request', () => {
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

  test.each([
    {
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        isEligible: () => true,
        hasMultipleSbiNumbersAttachedToBusinessEmail: () => false,
        isAlreadyOnWaitingList: () => false,
        hasAccessGranted: () => false
      },
      when: 'eligible business was found'
    }
  ])('when $when process it as eligible', async (testCase) => {
    when(checkEligibility)
      .calledWith(
        testCase.given.sbi,
        testCase.given.crn,
        testCase.given.businessEmail
      )
      .mockResolvedValue(testCase.given)

    await processRegisterYourInterestRequest({
      sbi: testCase.given.sbi,
      crn: testCase.given.crn,
      email: testCase.given.businessEmail
    })

    expect(logSpy).toHaveBeenCalledWith(`Processing register your interest request: ${JSON.stringify({
      sbi: testCase.given.sbi,
      crn: testCase.given.crn,
      email: testCase.given.businessEmail
    })}`)
    expect(processEligible).toHaveBeenCalledWith(testCase.given)
  })

  test.each([
    {
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        isEligible: () => false,
        hasMultipleSbiNumbersAttachedToBusinessEmail: () => false,
        isAlreadyOnWaitingList: () => false,
        hasAccessGranted: () => false
      },
      when: 'ineligible business was found'
    },
    {
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        isEligible: () => true,
        hasMultipleSbiNumbersAttachedToBusinessEmail: () => true,
        isAlreadyOnWaitingList: () => false,
        hasAccessGranted: () => false
      },
      when: 'eligible business was found but it had multiple sbi numbers attached to it'
    }
  ])('when $when process it as ineligible', async (testCase) => {
    when(checkEligibility)
      .calledWith(
        testCase.given.sbi,
        testCase.given.crn,
        testCase.given.businessEmail
      )
      .mockResolvedValue(testCase.given)

    await processRegisterYourInterestRequest({
      sbi: testCase.given.sbi,
      crn: testCase.given.crn,
      email: testCase.given.businessEmail
    })

    expect(logSpy).toHaveBeenCalledWith(`Processing register your interest request: ${JSON.stringify({
      sbi: testCase.given.sbi,
      crn: testCase.given.crn,
      email: testCase.given.businessEmail
    })}`)
    expect(processIneligible).toHaveBeenCalledWith(testCase.given)
  })

  test.each([
    {
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'wrong_email'
      },
      when: 'schema validation catched wrong email',
      expect: 'ValidationError: "email" must be a valid email'
    }
  ])('when $when throw schema validation error', async (testCase) => {
    expect(
      async () => {
        await processRegisterYourInterestRequest({
          sbi: testCase.given.sbi,
          crn: testCase.given.crn,
          email: testCase.given.businessEmail
        })
      }
    ).rejects.toThrowError(testCase.expect)
  })
})
