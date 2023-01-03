const { when, resetAllWhenMocks } = require('jest-when')

const API_URL = '/api/users'

describe('Eligibility Api - /api/users', () => {
  let db
  let server
  let consoleError

  beforeAll(async () => {
    jest.resetAllMocks()

    jest.mock('../../../../../app/data')
    db = require('../../../../../app/data')

    server = require('../../../../../app/server/server')
    await server.start()

    consoleError = jest.spyOn(console, 'error')
  })

  afterAll(async () => {
    await server.stop()
    jest.resetModules()
    resetAllWhenMocks()
  })

  describe('GET', () => {
    test.each([
      {
        emailAddress: 'business@email.com',
        farmers: [
          {
            sbi: 123456789,
            crn: '1234567890',
            customer_name: 'David Smith',
            business_name: 'David\'s Farm',
            business_email: 'business@email.com',
            business_address: 'Some Road, London, MK55 7ES',
            last_updated_at: undefined,
            waiting_updated_at: undefined,
            access_granted: true
          }
        ]
      }
    ])('Returns a farmer provided he is granted access', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}?emailAddress=${testCase.emailAddress}`
      }
      when(db.eligibility.findAll)
        .calledWith({
          where: {
            business_email: testCase.emailAddress
          }
        })
        .mockResolvedValue(testCase.farmers)

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(200)
      expect(payload).toEqual([
        {
        farmerName: testCase.farmers[0].customer_name,
        name: testCase.farmers[0].business_name,
        sbi: testCase.farmers[0].sbi,
        crn: testCase.farmers[0].crn,
        address: testCase.farmers[0].business_address,
        email: testCase.farmers[0].business_email
        }
      ])
    })

    test.each([
      {
        emailAddress: 'business@email.com',
        farmers: [
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
      {
        emailAddress: 'business@email.com',
        farmers: [{}]
      },
      {
        emailAddress: 'business@email.com',
        farmers: undefined
      }
    ])('Returns 404 if a farmer is not found or is not granted access', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}?emailAddress=${testCase.emailAddress}`
      }
      when(db.eligibility.findAll)
        .calledWith({
          where: {
            business_email: testCase.emailAddress
          }
        })
        .mockResolvedValue(testCase.farmers)

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(404)
      expect(payload).toEqual({
        error: 'Not Found',
        message: 'No farmer found',
        statusCode: 404
      })
    })

    test.each([
      {
        emailAddress: 'business@email.com',
        error: new Error('ECONNREFUSED')
      }
    ])('Returns 500 if some internal error', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}?emailAddress=${testCase.emailAddress}`
      }
      when(db.eligibility.findAll)
        .calledWith({
          where: {
            business_email: testCase.emailAddress
          }
        })
        .mockRejectedValue(testCase.error)

      const response = await server.inject(options)

      expect(response.statusCode).toBe(500)
      expect(consoleError).toHaveBeenCalledWith(testCase.error)
    })

    test.each([
      {
        queryString: ''
      },
      {
        queryString: '?emailAddress='
      },
      {
        queryString: '?emailAddress=not_an_email'
      }
    ])('Bad request. A valid email address must be specified. ($queryString)', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}${testCase.queryString}`
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(400)
      expect(response.statusMessage).toEqual('Bad Request')
      expect(payload.message).toEqual('A valid email address must be specified.')
    })
  })
})
