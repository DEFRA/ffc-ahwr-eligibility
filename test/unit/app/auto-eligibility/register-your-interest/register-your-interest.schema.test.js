const schema = require('../../../../../app/auto-eligibility/register-your-interest/register-your-interest.schema')

describe('Register your interest schema', () => {
  test.each([
    {
      toString: () => 'a valid register your interest',
      given: {
        registerYourInterest: {
          sbi: 111111111,
          crn: '1111111111',
          email: 'business@email.com'
        }
      },
      expect: {
        error: undefined
      }
    },
    {
      toString: () => 'a valid register your interest - uppercase email',
      given: {
        registerYourInterest: {
          sbi: 111111111,
          crn: '1111111111',
          email: 'Business@email.com'
        }
      },
      expect: {
        error: undefined
      }
    },
    {
      toString: () => 'an invalid register your interest - sbi too short',
      given: {
        registerYourInterest: {
          sbi: 11111111,
          crn: '1111111111',
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"sbi" must be greater than or equal to 100000000'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - crn too short',
      given: {
        registerYourInterest: {
          sbi: 111111111,
          crn: '111111111',
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"crn" with value "111111111" fails to match the required pattern: /^\\d{10}$/'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - email wrong format',
      given: {
        registerYourInterest: {
          sbi: 111111111,
          crn: '1111111111',
          email: 'businessemail.com'
        }
      },
      expect: {
        error: {
          message: '"email" must be a valid email'
        }
      }
    }
  ])('%s', (testCase) => {
    const result = schema.validate(testCase.given.registerYourInterest)

    expect(result.value).toEqual({
      ...testCase.given.registerYourInterest,
      email: testCase.given.registerYourInterest.email.toLowerCase()
    })
    if (testCase.expect.error) {
      expect(result.error.message).toEqual(testCase.expect.error.message)
    }
  })
})
