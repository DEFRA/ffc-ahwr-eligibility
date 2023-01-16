
const { when, resetAllWhenMocks } = require('jest-when')

const MOCK_NOW = new Date()

describe('Process register your interest request', () => {
  let logSpy
  let checkEligibility
  let processEligible
  let processIneligible
  let processRegisterYourInterestRequest

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    logSpy = jest.spyOn(console, 'log')

    jest.mock('../../../../../app/config/notify', () => ({
      apiKey: 'mockApiKey'
    }))

    jest.mock('../../../../../app/auto-eligibility/register-your-interest/check-eligibility')
    checkEligibility = require('../../../../../app/auto-eligibility/register-your-interest/check-eligibility')

    jest.mock('../../../../../app/auto-eligibility/register-your-interest/process-eligible-sbi')
    processEligible = require('../../../../../app/auto-eligibility/register-your-interest/process-eligible-sbi')

    jest.mock('../../../../../app/auto-eligibility/register-your-interest/process-ineligible-sbi')
    processIneligible = require('../../../../../app/auto-eligibility/register-your-interest/process-ineligible-sbi')

    processRegisterYourInterestRequest = require('../../../../../app/auto-eligibility/register-your-interest/process-register-your-interest')
  })

  afterAll(() => {
    resetAllWhenMocks()
    jest.resetModules()
    jest.useRealTimers()
  })

  test.each([
    {
      toString: () => 'when a customer is eligible',
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        sbiAlreadyRegistered: () => false,
        isRegisteringForEligibleSbi: () => true,
        businessEmailHasMultipleDistinctSbi: () => false,
        alreadyOnWaitingList: () => false,
        hasAccessGranted: () => false
      },
      expect: {
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing register your interest: ${JSON.stringify({
            sbi: 123456789,
            crn: '1234567890',
            email: 'business@email.com'
          })}`,
          `${MOCK_NOW.toISOString()} Register your interest has been processed successfully: ${JSON.stringify({
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
        isRegisteringForEligibleSbi: () => false,
        businessEmailHasMultipleDistinctSbi: () => false,
        alreadyOnWaitingList: () => false,
        hasAccessGranted: () => false
      },
      expect: {
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing register your interest: ${JSON.stringify({
            sbi: 123456789,
            crn: '1234567890',
            email: 'business@email.com'
          })}`,
          `${MOCK_NOW.toISOString()} Register your interest has been processed successfully: ${JSON.stringify({
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
