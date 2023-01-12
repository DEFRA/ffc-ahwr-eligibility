
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
    processEligible = require('../../../../../app/auto-eligibility/processing/process-eligible-customer')

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
      toString: () => 'when a customer is eligible',
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        sbiAlreadyRegistered: () => false,
        isEligible: () => true,
        businessEmailHasMultipleDistinctSbi: () => false,
        alreadyOnWaitingList: () => false,
        hasAccessGranted: () => false
      },
      expect: {
        consoleLogs: [
          `Processing register your interest request: ${JSON.stringify({
            sbi: 123456789,
            crn: '1234567890',
            email: 'business@email.com'
          })}`
        ]
      }
    }
  ])('%s', async (testCase) => {
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

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(processEligible).toHaveBeenCalledWith(testCase.given)
  })

  test.each([
    {
      toString: () => 'when a customer is ineligible',
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        sbiAlreadyRegistered: () => false,
        isEligible: () => false,
        businessEmailHasMultipleDistinctSbi: () => false,
        alreadyOnWaitingList: () => false,
        hasAccessGranted: () => false
      },
      expect: {
        consoleLogs: [
          `Processing register your interest request: ${JSON.stringify({
            sbi: 123456789,
            crn: '1234567890',
            email: 'business@email.com'
          })}`
        ]
      }
    }
  ])('%s', async (testCase) => {
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

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(processIneligible).toHaveBeenCalledWith(testCase.given)
  })

  test.each([
    {
      toString: () => 'when schema validation catched wrong email',
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'wrong_email'
      },
      expect: 'ValidationError: "email" must be a valid email'
    }
  ])('%s', async (testCase) => {
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
