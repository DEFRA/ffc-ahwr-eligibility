describe('process registration of interest', () => {
    let checkUniqueRegistrationOfInterestMock
    let processUniqueEmailMock
  
    beforeAll(() => {
      jest.mock('../../../../app/auto-eligibility/register-your-interest/check-unique-registration-of-interest')
      checkUniqueRegistrationOfInterestMock = require('../../../../app/auto-eligibility/register-your-interest/check-unique-registration-of-interest')
  
      jest.mock('../../../../app/auto-eligibility/register-your-interest/process-unique-email')
      processUniqueEmailMock = require('../../../../app/auto-eligibility/register-your-interest/process-unique-email')
    })
  
    beforeEach(() => {
      jest.resetAllMocks()
    })
  
    test.each([
      {
        toString: () => 'should process registration',
        given: {
          email: 'business@email.com'
        },
        when: {
          isUnique: true
        }
      },
      {
        toString: () => 'should not process registration - duplicate',
        given: {
          email: 'business@email.com'
        },
        when: {
          isUnique: false
        }
      },
      {
        toString: () => 'should process registration with custom top level domain',
        given: {
          email: 'business@email.some.random.domain'
        },
        when: {
          isUnique: true
        }
      }
    ])('%s', async (testCase) => {
      const processRegistrationOfInterest = require('../../../../app/auto-eligibility/register-your-interest/process-register-your-interest')
      checkUniqueRegistrationOfInterestMock.mockResolvedValueOnce(testCase.when.isUnique)
      await processRegistrationOfInterest({ email: testCase.given.email })
      expect(checkUniqueRegistrationOfInterestMock).toBeCalledTimes(1)
      if (testCase.when.isUnique) {
        expect(processUniqueEmailMock).toBeCalledWith(testCase.given.email)
      }
    })
  
    test.each([
      {
        toString: () => 'should fail email validation',
        given: {
          email: null
        },
        then: {
          error: 'ValidationError: "value" must be a string'
        }
      },
      {
        toString: () => 'should fail email validation',
        given: {
          email: undefined
        },
        then: {
          error: 'ValidationError: "value" is required'
        }
      },
      {
        toString: () => 'should fail email validation',
        given: {
          email: 'testwithoutdomain'
        },
        then: {
          error: 'ValidationError: "value" must be a valid email'
        }
      }
    ])('%s', async (testCase) => {
      const processRegistrationOfInterest = require('../../../../app/auto-eligibility/register-your-interest/process-register-your-interest')
      try {
        await processRegistrationOfInterest({ email: testCase.given.email })
      } catch (e) {
        expect(e.message).toEqual(testCase.then.error)
      }
    })
  })
  