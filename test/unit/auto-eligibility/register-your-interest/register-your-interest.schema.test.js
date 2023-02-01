const schema = require('../../../../app/auto-eligibility/schema/register-your-interest.schema')

describe('Register your interest schema', () => {
  test.each([
    {
      toString: () => 'a valid register your interest',
      given: {
        registerYourInterest: {
          sbi: 105321000,
          crn: 1100000000,
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
          sbi: 105321000,
          crn: 1100000000,
          email: 'Business@email.com'
        }
      },
      expect: {
        error: undefined
      }
    },
    {
      toString: () => 'an invalid register your interest - sbi not a number',
      given: {
        registerYourInterest: {
          sbi: 'ABCDEFGHI',
          crn: '1100000000',
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"sbi" must be a number'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - crn not a number',
      given: {
        registerYourInterest: {
          sbi: 105321000,
          crn: 'ABCDEFJHIJ',
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"crn" must be a number'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - sbi empty',
      given: {
        registerYourInterest: {
          sbi: '',
          crn: '1100000000',
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"sbi" must be a number'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - crn empty',
      given: {
        registerYourInterest: {
          sbi: 105321000,
          crn: '',
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"crn" must be a number'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - sbi null',
      given: {
        registerYourInterest: {
          crn: '1100000000',
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"sbi" is required'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - crn null',
      given: {
        registerYourInterest: {
          sbi: 105321000,
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"crn" is required'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - email empty',
      given: {
        registerYourInterest: {
          sbi: 105321000,
          crn: 1100000000,
          email: ''
        }
      },
      expect: {
        error: {
          message: '"email" is not allowed to be empty'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - sbi too low',
      given: {
        registerYourInterest: {
          sbi: 104999999,
          crn: 1100000000,
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"sbi" must be greater than or equal to 105000000'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - crn too low',
      given: {
        registerYourInterest: {
          sbi: 105321000,
          crn: 1099999999,
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"crn" must be greater than or equal to 1100000000'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - sbi too high',
      given: {
        registerYourInterest: {
          sbi: 210000001,
          crn: 1100000000,
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"sbi" must be less than or equal to 210000000'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - crn too high',
      given: {
        registerYourInterest: {
          sbi: 210000000,
          crn: 1110000001,
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"crn" must be less than or equal to 1110000000'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - sbi not an int',
      given: {
        registerYourInterest: {
          sbi: 105000000.123,
          crn: 1100000000,
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"sbi" must be an integer'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - crn not an int',
      given: {
        registerYourInterest: {
          sbi: 210000000,
          crn: 1100000000.123,
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"crn" must be an integer'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - sbi too short',
      given: {
        registerYourInterest: {
          sbi: 99999999,
          crn: 1100000000,
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"sbi" must be greater than 99999999.9'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - crn too short',
      given: {
        registerYourInterest: {
          sbi: 105000000,
          crn: 111111111,
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"crn" must be greater than 999999999.9'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - sbi too long',
      given: {
        registerYourInterest: {
          sbi: 1000000000,
          crn: 1100000000,
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"sbi" must be less than 1000000000'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - crn too long',
      given: {
        registerYourInterest: {
          sbi: 105000000,
          crn: 10000000000,
          email: 'business@email.com'
        }
      },
      expect: {
        error: {
          message: '"crn" must be less than 10000000000'
        }
      }
    },
    {
      toString: () => 'an invalid register your interest - email wrong format',
      given: {
        registerYourInterest: {
          sbi: 105000000,
          crn: 1100000000,
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
