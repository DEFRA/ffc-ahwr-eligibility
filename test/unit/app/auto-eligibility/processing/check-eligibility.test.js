const { when, resetAllWhenMocks } = require('jest-when')

describe('checkEligibility', () => {
  let db
  let checkEligibility

  beforeAll(async () => {
    jest.mock('../../../../../app/data')
    db = require('../../../../../app/data')

    checkEligibility = require('../../../../../app/auto-eligibility/processing/check-eligibility')

    consoleError = jest.spyOn(console, 'error')
  })

  afterAll(async () => {
    jest.resetModules()
    jest.resetAllMocks()
    resetAllWhenMocks()
  })

  test.each([
    {
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        foundBusinesses: []
      },
      when: 'no businesses were found',
      expect: {
        isEligible: false,
        hasMultipleSbiNumbersAttachedToBusinessEmail: false,
        isAlreadyOnWaitingList: false,
        hasAccessGranted: false
      }
    },
    {
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        foundBusinesses: [
          {
            sbi: 123456789,
            crn: '1234567890',
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
      when: 'one business was found',
      expect: {
        isEligible: true,
        hasMultipleSbiNumbersAttachedToBusinessEmail: false,
        isAlreadyOnWaitingList: false,
        hasAccessGranted: false
      }
    },
    {
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        foundBusinesses: [
          {
            sbi: 123456789,
            crn: '1234567890',
            customer_name: 'David Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: new Date(),
            access_granted: false
          }
        ]
      },
      when: 'a business already on the waiting list was found',
      expect: {
        isEligible: true,
        hasMultipleSbiNumbersAttachedToBusinessEmail: false,
        isAlreadyOnWaitingList: true,
        hasAccessGranted: false
      }
    },
    {
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        foundBusinesses: [
          {
            sbi: 123456789,
            crn: '1234567890',
            customer_name: 'David Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: new Date(),
            access_granted: true
          }
        ]
      },
      when: 'a business with access granted was found',
      expect: {
        isEligible: true,
        hasMultipleSbiNumbersAttachedToBusinessEmail: false,
        isAlreadyOnWaitingList: true,
        hasAccessGranted: true
      }
    },
    {
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        foundBusinesses: [
          {
            sbi: 123456789,
            crn: '1234567890',
            customer_name: 'David Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: undefined,
            access_granted: false
          },
          {
            sbi: 111456789,
            crn: '1114567890',
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
      when: 'multiple businesses were found',
      expect: {
        isEligible: true,
        hasMultipleSbiNumbersAttachedToBusinessEmail: true,
        isAlreadyOnWaitingList: false,
        hasAccessGranted: false
      }
    },
    {
      given: {
        sbi: 123456789,
        crn: '1234567890',
        businessEmail: 'business@email.com',
        foundBusinesses: [
          {
            sbi: 111456789,
            crn: '1114567890',
            customer_name: 'David Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: undefined,
            access_granted: false
          },
          {
            sbi: 123456789,
            crn: '1234567890',
            customer_name: 'David Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: new Date(),
            access_granted: true
          }
        ]
      },
      when: 'multiple businesses were found and the eligible one was already on the waiting list',
      expect: {
        isEligible: true,
        hasMultipleSbiNumbersAttachedToBusinessEmail: true,
        isAlreadyOnWaitingList: true,
        hasAccessGranted: true
      }
    }
  ])('when $when for given sbi and crn and businessEmail', async (testCase) => {
    when(db.eligibility.findAll)
      .calledWith({
        where: {
          business_email: testCase.given.businessEmail
        }
      })
      .mockResolvedValue(testCase.given.foundBusinesses)
    
    const business = await checkEligibility(
      testCase.given.sbi,
      testCase.given.crn,
      testCase.given.businessEmail
    )

    expect(business.sbi).toEqual(testCase.given.sbi)
    expect(business.crn).toEqual(testCase.given.crn)
    expect(business.businessEmail).toEqual(testCase.given.businessEmail)
    expect(business.isEligible()).toEqual(testCase.expect.isEligible)
    expect(business.hasMultipleSbiNumbersAttachedToBusinessEmail()).toEqual(
      testCase.expect.hasMultipleSbiNumbersAttachedToBusinessEmail
    )
    expect(business.isAlreadyOnWaitingList()).toEqual(
      testCase.expect.isAlreadyOnWaitingList
    )
    expect(business.hasAccessGranted()).toEqual(testCase.expect.hasAccessGranted)
  })
})
