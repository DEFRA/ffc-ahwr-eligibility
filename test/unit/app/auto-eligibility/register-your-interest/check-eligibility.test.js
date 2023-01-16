const { when, resetAllWhenMocks } = require('jest-when')
const { Op, fn, col } = require('sequelize')

const MOCK_NOW = new Date()

describe('checkEligibility', () => {
  let logSpy
  let db
  let checkEligibility

  beforeAll(async () => {
    jest.mock('../../../../../app/data')
    db = require('../../../../../app/data')

    checkEligibility = require('../../../../../app/auto-eligibility/register-your-interest/check-eligibility')

    logSpy = jest.spyOn(console, 'log')
  })

  afterAll(async () => {
    jest.resetModules()
    resetAllWhenMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test.each([
    {
      toString: () => 'when no customers were found',
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com'
      },
      when: {
        foundCustomers: []
      },
      expect: {
        isRegisteringForEligibleSbi: false,
        businessEmailHasMultipleDistinctSbi: false,
        consoleLogs: [
          `Checking eligibility: ${JSON.stringify({ sbi: 123456789, crn: '1234567890', businessEmail: 'business@email.com' })}`,
          `Finding all by sbi or business_email: ${JSON.stringify({ sbi: 123456789, businessEmail: 'business@email.com' })}`,
          `Found customers: ${JSON.stringify([])}`,
          'Eligible SBI not found'
        ]
      }
    },
    {
      toString: () => 'when one eligible customer was found',
      given: {
        sbi: '111111111',
        crn: '1111111111',
        businessEmail: 'business@email.com'
      },
      when: {
        foundCustomers: [
          {
            sbi: 111111111,
            crn: '1111111111',
            customer_name: 'David Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: undefined,
            access_granted: false
          }
        ]
      },
      expect: {
        isRegisteringForEligibleSbi: true,
        businessEmailHasMultipleDistinctSbi: false,
        consoleLogs: [
          `Checking eligibility: ${JSON.stringify({ sbi: '111111111', crn: '1111111111', businessEmail: 'business@email.com' })}`,
          `Finding all by sbi or business_email: ${JSON.stringify({ sbi: '111111111', businessEmail: 'business@email.com' })}`,
          `Found customers: ${JSON.stringify([
            {
              sbi: 111111111,
              crn: '1111111111',
              customer_name: 'David Smith',
              business_name: 'David\'s Farm',
              business_email: 'business@email.com',
              business_address: 'Some Road, London, MK55 7ES',
              last_updated_at: undefined,
              waiting_updated_at: undefined,
              access_granted: false
            }
          ])}`,
          `Eligible SBI found: ${JSON.stringify({
            sbi: 111111111,
            crn: '1111111111',
            customer_name: 'David Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            access_granted: false
          })}`
        ]
      }
    },
    {
      toString: () => 'when one ineligible customer was found',
      given: {
        sbi: '111111111',
        crn: '1111111111',
        businessEmail: 'business@email.com'
      },
      when: {
        foundCustomers: [
          {
            sbi: 222222222,
            crn: '2222222222',
            customer_name: 'David Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: undefined,
            access_granted: false
          }
        ]
      },
      expect: {
        isRegisteringForEligibleSbi: false,
        businessEmailHasMultipleDistinctSbi: false,
        consoleLogs: [
          `Checking eligibility: ${JSON.stringify({ sbi: '111111111', crn: '1111111111', businessEmail: 'business@email.com' })}`,
          `Finding all by sbi or business_email: ${JSON.stringify({ sbi: '111111111', businessEmail: 'business@email.com' })}`,
          `Found customers: ${JSON.stringify([
            {
              sbi: 222222222,
              crn: '2222222222',
              customer_name: 'David Smith',
              business_name: 'David\'s Farm',
              business_email: 'business@email.com',
              business_address: 'Some Road, London, MK55 7ES',
              last_updated_at: undefined,
              waiting_updated_at: undefined,
              access_granted: false
            }
          ])}`,
          'Eligible SBI not found'
        ]
      }
    },
    {
      toString: () => 'when sbi already registered',
      given: {
        sbi: '111111111',
        crn: '1111111111',
        businessEmail: 'business@email.com'
      },
      when: {
        foundCustomers: [
          {
            sbi: 111111111,
            crn: '1111111111',
            customer_name: 'David Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: undefined,
            access_granted: false
          },
          {
            sbi: 111111111,
            crn: '2222222222',
            customer_name: 'Susan Smith',
            business_name: 'David\'s Farm',
            business_email: 'business2@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: MOCK_NOW,
            access_granted: false
          }
        ]
      },
      expect: {
        isRegisteringForEligibleSbi: false,
        businessEmailHasMultipleDistinctSbi: false,
        consoleLogs: [
          `Checking eligibility: ${JSON.stringify({ sbi: '111111111', crn: '1111111111', businessEmail: 'business@email.com' })}`,
          `Finding all by sbi or business_email: ${JSON.stringify({ sbi: '111111111', businessEmail: 'business@email.com' })}`,
          `Found customers: ${JSON.stringify([
            {
              sbi: 111111111,
              crn: '1111111111',
              customer_name: 'David Smith',
              business_name: 'David\'s Farm',
              business_email: 'business@email.com',
              business_address: 'Some Road, London, MK55 7ES',
              last_updated_at: undefined,
              waiting_updated_at: undefined,
              access_granted: false
            },
            {
              sbi: 111111111,
              crn: '2222222222',
              customer_name: 'Susan Smith',
              business_name: 'David\'s Farm',
              business_email: 'business2@email.com',
              business_address: 'Some Road, London, MK55 7ES',
              last_updated_at: undefined,
              waiting_updated_at: MOCK_NOW,
              access_granted: false
            }
          ])}`,
          `SBI already registered: ${JSON.stringify({ sbi: '111111111' })}`
        ]
      }
    },
    {
      toString: () => 'when eligible customer was found with a business email that had multiple distinct sbi',
      given: {
        sbi: '222222222',
        crn: '2222222222',
        businessEmail: 'business@email.com'
      },
      when: {
        foundCustomers: [
          {
            sbi: 111111111,
            crn: '1111111111',
            customer_name: 'David Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: undefined,
            access_granted: false
          },
          {
            sbi: 222222222,
            crn: '2222222222',
            customer_name: 'Susan Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: undefined,
            access_granted: false
          }
        ]
      },
      expect: {
        isRegisteringForEligibleSbi: true,
        businessEmailHasMultipleDistinctSbi: true,
        consoleLogs: [
          `Checking eligibility: ${JSON.stringify({ sbi: '222222222', crn: '2222222222', businessEmail: 'business@email.com' })}`,
          `Finding all by sbi or business_email: ${JSON.stringify({ sbi: '222222222', businessEmail: 'business@email.com' })}`,
          `Found customers: ${JSON.stringify([
            {
              sbi: 111111111,
              crn: '1111111111',
              customer_name: 'David Smith',
              business_name: 'David\'s Farm',
              business_email: 'business@email.com',
              business_address: 'Some Road, London, MK55 7ES',
              last_updated_at: undefined,
              waiting_updated_at: undefined,
              access_granted: false
            },
            {
              sbi: 222222222,
              crn: '2222222222',
              customer_name: 'Susan Smith',
              business_name: 'David\'s Farm',
              business_email: 'business@email.com',
              business_address: 'Some Road, London, MK55 7ES',
              last_updated_at: undefined,
              waiting_updated_at: undefined,
              access_granted: false
            }
          ])}`,
          `Eligible SBI found: ${JSON.stringify({
            sbi: 222222222,
            crn: '2222222222',
            customer_name: 'Susan Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            access_granted: false
          })}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    when(db.customer.findAll)
      .calledWith({
        attributes: [
          [fn('TO_NUMBER', col('sbi')), 'sbi'],
          'crn',
          'customer_name',
          'business_name',
          [fn('LOWER', col('business_email')), 'business_email'],
          'business_address',
          'last_updated_at',
          'waiting_updated_at',
          'access_granted'
        ],
        where: {
          [Op.or]: [
            { sbi: testCase.given.sbi },
            { business_email: testCase.given.businessEmail }
          ]
        }
      })
      .mockResolvedValue(testCase.when.foundCustomers)

    const business = await checkEligibility(
      testCase.given.sbi,
      testCase.given.crn,
      testCase.given.businessEmail
    )

    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
    expect(business.sbi).toEqual(testCase.given.sbi)
    expect(business.crn).toEqual(testCase.given.crn)
    expect(business.businessEmail).toEqual(testCase.given.businessEmail)
    expect(business.isRegisteringForEligibleSbi()).toEqual(testCase.expect.isRegisteringForEligibleSbi)
    expect(business.businessEmailHasMultipleDistinctSbi()).toEqual(
      testCase.expect.businessEmailHasMultipleDistinctSbi
    )
  })
})
