const { when, resetAllWhenMocks } = require('jest-when')
const { fn, col, where } = require('sequelize')

const API_URL = '/api/waiting-list'

describe('Eligibility Api - /api/waiting-list', () => {
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
        farmer: [{
          business_email: 'business@email.com',
          created_at: new Date(),
          access_granted: true,
          access_granted_at: new Date()
        }]
      },
      {
        emailAddress: 'business@email.com',
        farmer: [{
          business_email: 'business@email.com',
          created_at: new Date(),
          access_granted: false,
          access_granted_at: new Date()
        }]
      },
      {
        emailAddress: 'business@email.com',
        farmer: null
      }
    ])('Returns a farmer\'s register status', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}/check-duplicate-registration?emailAddress=${testCase.emailAddress}`
      }
      when(db.waiting_list.findAll)
        .calledWith({
          attributes: [
            [fn('LOWER', col('business_email')), 'business_email'],
            'created_at',
            'access_granted',
            'access_granted_at'
          ],
          where: {
            business_email: where(fn('LOWER', col('business_email')), testCase.emailAddress)
          }
        })
        .mockResolvedValue(testCase.farmer)

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(200)
      expect(payload).toEqual({
        alreadyRegistered: testCase.farmer !== null,
        accessGranted: testCase.farmer !== null ? testCase.farmer[0].access_granted : false
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
        url: `${API_URL}/check-duplicate-registration?emailAddress=${testCase.emailAddress}`
      }
      when(db.waiting_list.findAll)
        .calledWith({
          attributes: [
            [fn('LOWER', col('business_email')), 'business_email'],
            'created_at',
            'access_granted',
            'access_granted_at'
          ],
          where: {
            business_email: where(fn('LOWER', col('business_email')), testCase.emailAddress)
          }
        })
        .mockRejectedValue(testCase.error)

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(500)
      expect(consoleError).toHaveBeenCalledWith(testCase.error)
      expect(response.statusMessage).toEqual('Internal Server Error')
      expect(payload.message).toEqual('An internal server error occurred')
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
        url: `${API_URL}/check-duplicate-registration${testCase.queryString}`
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(400)
      expect(response.statusMessage).toEqual('Bad Request')
      expect(payload.message).toEqual('A valid email address must be specified.')
    })
  })
})
