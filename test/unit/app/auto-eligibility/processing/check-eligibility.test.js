const { when, resetAllWhenMocks } = require('jest-when')
const { Op } = require('sequelize')

describe('checkEligibility', () => {
  let logSpy
  let db
  let checkEligibility

  beforeAll(async () => {
    jest.mock('../../../../../app/data')
    db = require('../../../../../app/data')

    checkEligibility = require('../../../../../app/auto-eligibility/processing/check-eligibility')

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
        businessEmail: 'business@email.com',
      },
      when: {
        foundCustomers: []
      },
      expect: {
        sbiAlreadyRegistered: false,
        isEligible: false,
        businessEmailHasMultipleDistinctSbi: false,
        alreadyOnWaitingList: false,
        hasAccessGranted: false,
        consoleLogs: [
          `Checking eligibility: ${JSON.stringify({ sbi: 123456789, crn: '1234567890', businessEmail: 'business@email.com' })}`,
          `Finding all by sbi or business_email: ${JSON.stringify({ sbi: 123456789, businessEmail: 'business@email.com' })}`,
          `Found customers: ${JSON.stringify([])}`,
          'Eligible customer not found'
        ]
      }
    },
    {
      toString: () => 'when one eligible customer was found',
      given: {
        sbi: 111111111,
        crn: '1111111111',
        businessEmail: 'business@email.com',
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
        sbiAlreadyRegistered: false,
        isEligible: true,
        businessEmailHasMultipleDistinctSbi: false,
        alreadyOnWaitingList: false,
        hasAccessGranted: false,
        consoleLogs: [
          `Checking eligibility: ${JSON.stringify({ sbi: 111111111, crn: '1111111111', businessEmail: 'business@email.com' })}`,
          `Finding all by sbi or business_email: ${JSON.stringify({ sbi: 111111111, businessEmail: 'business@email.com' })}`,
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
          `Eligible customer found: ${JSON.stringify({
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
        sbi: 111111111,
        crn: '1111111111',
        businessEmail: 'business@email.com',
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
        sbiAlreadyRegistered: false,
        isEligible: false,
        businessEmailHasMultipleDistinctSbi: false,
        alreadyOnWaitingList: false,
        hasAccessGranted: false,
        consoleLogs: [
          `Checking eligibility: ${JSON.stringify({ sbi: 111111111, crn: '1111111111', businessEmail: 'business@email.com' })}`,
          `Finding all by sbi or business_email: ${JSON.stringify({ sbi: 111111111, businessEmail: 'business@email.com' })}`,
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
          'Eligible customer not found'
        ]
      }
    },
    {
      toString: () => 'when sbi already registered',
      given: {
        sbi: 111111111,
        crn: '1111111111',
        businessEmail: 'business@email.com',
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
            waiting_updated_at: new Date(),
            access_granted: false
          }
        ]
      },
      expect: {
        sbiAlreadyRegistered: true,
        isEligible: false,
        businessEmailHasMultipleDistinctSbi: false,
        alreadyOnWaitingList: false,
        hasAccessGranted: false,
        consoleLogs: [
          `Checking eligibility: ${JSON.stringify({ sbi: 111111111, crn: '1111111111', businessEmail: 'business@email.com' })}`,
          `Finding all by sbi or business_email: ${JSON.stringify({ sbi: 111111111, businessEmail: 'business@email.com' })}`,
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
              waiting_updated_at: new Date(),
              access_granted: false
            }
          ])}`,
          `Sbi already registered: ${JSON.stringify({ sbi: 111111111 })}`
        ]
      }
    },
    {
      toString: () => 'when eligible customer was found with a business email that had multiple distinct sbi',
      given: {
        sbi: 222222222,
        crn: '2222222222',
        businessEmail: 'business@email.com',
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
        sbiAlreadyRegistered: false,
        isEligible: true,
        businessEmailHasMultipleDistinctSbi: true,
        alreadyOnWaitingList: false,
        hasAccessGranted: false,
        consoleLogs: [
          `Checking eligibility: ${JSON.stringify({ sbi: 222222222, crn: '2222222222', businessEmail: 'business@email.com' })}`,
          `Finding all by sbi or business_email: ${JSON.stringify({ sbi: 222222222, businessEmail: 'business@email.com' })}`,
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
          `Eligible customer found: ${JSON.stringify({
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
  ])(`%s`, async (testCase) => {
    when(db.eligibility.findAll)
      .calledWith({
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
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx+1, consoleLog)
    )
    expect(business.sbi).toEqual(testCase.given.sbi)
    expect(business.crn).toEqual(testCase.given.crn)
    expect(business.businessEmail).toEqual(testCase.given.businessEmail)
    expect(business.sbiAlreadyRegistered()).toEqual(testCase.expect.sbiAlreadyRegistered)
    expect(business.isEligible()).toEqual(testCase.expect.isEligible)
    expect(business.businessEmailHasMultipleDistinctSbi()).toEqual(
      testCase.expect.businessEmailHasMultipleDistinctSbi
    )
    expect(business.alreadyOnWaitingList()).toEqual(
      testCase.expect.alreadyOnWaitingList
    )
    expect(business.hasAccessGranted()).toEqual(testCase.expect.hasAccessGranted)
  })
})
