
const { when, resetAllWhenMocks } = require('jest-when')
const MOCK_NOW = new Date()

describe('Process register your interest request', () => {
  describe('When defraId is disabled', () => {
    let logSpy
    let checkEligibility
    let processEligible
    let processIneligible
    let processRegisterYourInterestRequest

    beforeAll(() => {
      jest.useFakeTimers('modern')
      jest.setSystemTime(MOCK_NOW)

      logSpy = jest.spyOn(console, 'log')

      jest.mock('../../../../app/config/notify', () => ({
        apiKey: 'mockApiKey'
      }))

      jest.mock('../../../../app/auto-eligibility/config', () => ({
        defraId: {
          enabled: false
        }
      }))

      jest.mock('../../../../app/auto-eligibility/register-your-interest/check-eligibility')
      checkEligibility = require('../../../../app/auto-eligibility/register-your-interest/check-eligibility')

      jest.mock('../../../../app/auto-eligibility/register-your-interest/process-eligible-sbi')
      processEligible = require('../../../../app/auto-eligibility/register-your-interest/process-eligible-sbi')

      jest.mock('../../../../app/auto-eligibility/register-your-interest/process-ineligible-sbi')
      processIneligible = require('../../../../app/auto-eligibility/register-your-interest/process-ineligible-sbi')

      processRegisterYourInterestRequest = require('../../../../app/auto-eligibility/register-your-interest/process-register-your-interest')
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
          sbi: 105000000,
          crn: '1100000000',
          businessEmail: 'business@email.com',
          isRegisteringForEligibleSbi: true
        },
        expect: {
          consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing register your interest: ${JSON.stringify({
            sbi: 105000000,
            crn: '1100000000',
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
          sbi: 105000000,
          crn: '1100000000',
          businessEmail: 'business@email.com',
          isRegisteringForEligibleSbi: false
        },
        expect: {
          consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing register your interest: ${JSON.stringify({
            sbi: 105000000,
            crn: '1100000000',
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
          sbi: 105000000,
          crn: '1100000000',
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
  describe('When defraId is enabled', () => {
    let logSpy
    let checkUniqueRegistrationOfInterest
    let processUniqueEmail
    let processDuplicateEmail
    let processRegisterYourInterestRequest

    beforeAll(() => {
      jest.useFakeTimers('modern')
      jest.setSystemTime(MOCK_NOW)

      logSpy = jest.spyOn(console, 'log')

      jest.mock('../../../../app/config/notify', () => ({
        apiKey: 'mockApiKey'
      }))

      jest.mock('../../../../app/auto-eligibility/config', () => ({
        defraId: {
          enabled: true
        }
      }))

      jest.mock('../../../../app/auto-eligibility/register-your-interest/check-unique-registration-of-interest')
      checkUniqueRegistrationOfInterest = require('../../../../app/auto-eligibility/register-your-interest/check-unique-registration-of-interest')

      jest.mock('../../../../app/auto-eligibility/register-your-interest/process-unique-email')
      processUniqueEmail = require('../../../../app/auto-eligibility/register-your-interest/process-unique-email')

      jest.mock('../../../../app/auto-eligibility/register-your-interest/process-duplicate-email')
      processDuplicateEmail = require('../../../../app/auto-eligibility/register-your-interest/process-duplicate-email')

      processRegisterYourInterestRequest = require('../../../../app/auto-eligibility/register-your-interest/process-register-your-interest')
    })

    afterAll(() => {
      resetAllWhenMocks()
      jest.resetModules()
      jest.useRealTimers()
    })

    beforeEach(() => {
      logSpy.mockClear()
    })

    test.each([
      {
        toString: () => 'when a email is unique',
        given: {
          businessEmail: 'business@email.com'
        },
        when: {
          unique: true
        },
        expect: {
          consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing register your interest: ${JSON.stringify({
            email: 'business@email.com'
          })}`
          ]
        }
      }
    ])('%s', async (testCase) => {
      when(checkUniqueRegistrationOfInterest)
        .calledWith(
          testCase.given.businessEmail
        )
        .mockResolvedValue(testCase.when.unique)

      await processRegisterYourInterestRequest({
        email: testCase.given.businessEmail
      })

      testCase.expect.consoleLogs.forEach(
        (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
      )
      expect(processUniqueEmail).toHaveBeenCalledWith(testCase.given.businessEmail)
    })

    test.each([
      {
        toString: () => 'when a customer is not unique',
        given: {
          businessEmail: 'business@email.com'
        },
        when: {
          unique: false
        },
        expect: {
          consoleLogs: [
          `${MOCK_NOW.toISOString()} Processing register your interest: ${JSON.stringify({
            email: 'business@email.com'
          })}`
          ]
        }
      }
    ])('%s', async (testCase) => {
      when(checkUniqueRegistrationOfInterest)
        .calledWith(
          testCase.given.businessEmail
        )
        .mockResolvedValue(testCase.when.unique)

      await processRegisterYourInterestRequest({
        email: testCase.given.businessEmail
      })

      testCase.expect.consoleLogs.forEach(
        (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
      )
      expect(processDuplicateEmail).toHaveBeenCalledWith(testCase.given.businessEmail)
    })

    test.each([
      {
        toString: () => 'when email is not valid',
        given: {
          businessEmail: 'wrong_email'
        },
        expect: 'ValidationError: "value" must be a valid email'
      }
    ])('%s', async (testCase) => {
      expect(
        async () => {
          await processRegisterYourInterestRequest({
            email: testCase.given.businessEmail
          })
        }
      ).rejects.toThrowError(testCase.expect)
    })
  })
})
