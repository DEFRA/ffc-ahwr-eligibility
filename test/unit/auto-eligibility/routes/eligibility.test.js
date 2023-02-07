const { when, resetAllWhenMocks } = require('jest-when')
const { fn, col, where } = require('sequelize')

const API_URL = '/api/eligibility'

describe('Eligibility Api - /api/eligibility', () => {
  let db
  let server
  let consoleError

  beforeAll(async () => {
    jest.resetAllMocks()

    jest.mock('../../../../app/data')
    db = require('../../../../app/data')

    server = require('../../../../app/server/server')
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
        farmer: {
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
      }
    ])('Returns a farmer provided he is granted access', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}?emailAddress=${testCase.emailAddress}`
      }
      when(db.customer.findOne)
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
            business_email: where(fn('LOWER', col('business_email')), testCase.emailAddress),
            access_granted: true
          }
        })
        .mockResolvedValue(testCase.farmer)

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(200)
      expect(payload).toEqual({
        farmerName: testCase.farmer.customer_name,
        name: testCase.farmer.business_name,
        sbi: testCase.farmer.sbi,
        crn: testCase.farmer.crn,
        address: testCase.farmer.business_address,
        email: testCase.farmer.business_email
      })
    })

    test.each('Returns 404 if a farmer is not found or is not granted access', async () => {
      const options = {
        method: 'GET',
        url: `${API_URL}?emailAddress=notaccessgranted@email.com`
      }
      when(db.customer.findOne)
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
            business_email: where(fn('LOWER', col('business_email')), 'notaccessgranted@email.com'),
            access_granted: true
          }
        })
        .mockResolvedValue(null)

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(404)
      expect(payload).toEqual({
        error: 'Not Found',
        message: 'Farmer not found',
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
      when(db.customer.findOne)
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
            business_email: where(fn('LOWER', col('business_email')), testCase.emailAddress),
            access_granted: true
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
