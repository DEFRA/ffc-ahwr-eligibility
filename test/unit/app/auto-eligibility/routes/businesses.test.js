const { when, resetAllWhenMocks } = require('jest-when')
const { Op, fn, col } = require('sequelize')

const API_URL = '/api/businesses'

describe(`Eligibility Api - ${API_URL}`, () => {
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
      },
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
          },
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
    ])('Returns farmer list provided they are granted access', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}?emailAddress=${testCase.emailAddress}`
      }
      when(db.customer.findAll)
        .calledWith({
          attributes: [
            'sbi',
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
            [Op.and]: [
              { business_email: testCase.emailAddress },
              { access_granted: true }
            ]
          }
        })
        .mockResolvedValue(testCase.farmers)

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(200)
      expect(payload).toEqual(
        testCase.farmers.filter(farmer => farmer.access_granted).map(farmer => ({
          farmerName: farmer.customer_name,
          name: farmer.business_name,
          sbi: farmer.sbi,
          crn: farmer.crn,
          address: farmer.business_address,
          email: farmer.business_email
        }))
      )
    })

    test.each([
      {
        emailAddress: 'business@email.com',
        farmers: []
      },
      {
        emailAddress: 'business@email.com',
        farmers: undefined
      }
    ])('Returns 404 if no farmer is found or is not granted access', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}?emailAddress=${testCase.emailAddress}`
      }
      when(db.customer.findAll)
        .calledWith({
          attributes: [
            'sbi',
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
            [Op.and]: [
              { business_email: testCase.emailAddress },
              { access_granted: true }
            ]
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
      when(db.customer.findAll)
        .calledWith({
          attributes: [
            'sbi',
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
            [Op.and]: [
              { business_email: testCase.emailAddress },
              { access_granted: true }
            ]
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
