const API_URL = '/api/waiting-list'

describe('Eligibility Api - /api/waiting-list', () => {
  let waitingListTable
  let server
  let consoleError

  beforeAll(async () => {
    jest.resetAllMocks()

    jest.mock('../../../../app/auto-eligibility/db/waiting-list.db.table')
    waitingListTable = require('../../../../app/auto-eligibility/db/waiting-list.db.table')

    server = require('../../../../app/server/server')
    await server.start()

    consoleError = jest.spyOn(console, 'error')
  })

  afterAll(async () => {
    await server.stop()
    jest.resetAllMocks()
  })

  describe('GET', () => {
    test.each([
      {
        emailAddress: 'business1@email.com',
        farmer: [{
          business_email: 'business@email.com',
          created_at: new Date(),
          access_granted: true,
          access_granted_at: new Date()
        }],
        alreadyRegistered: true
      },
      {
        emailAddress: 'business2@email.com',
        farmer: [{
          business_email: 'business@email.com',
          created_at: new Date(),
          access_granted: false,
          access_granted_at: null
        }],
        alreadyRegistered: true
      },
      {
        emailAddress: 'business3@email.com',
        farmer: null,
        alreadyRegistered: false
      }
    ])('Returns a farmer\'s register status', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}?emailAddress=${testCase.emailAddress}`
      }
      waitingListTable.findAllByBusinessEmail.mockResolvedValueOnce(testCase.farmer)

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(200)
      expect(payload).toEqual({
        alreadyRegistered: testCase.alreadyRegistered,
        accessGranted: testCase.farmer !== null ? testCase.farmer[0].access_granted : false
      })
    })

    test.each([
      {
        emailAddress: 'business@email.com'
      }
    ])('Returns 500 if some internal error', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${API_URL}?emailAddress=${testCase.emailAddress}`,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      waitingListTable.findAllByBusinessEmail.mockImplementation(() => {
        throw new Error('Some error')
      })

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(500)
      expect(consoleError).toHaveBeenCalledWith('Error returned when retreiving waiting list status for business@email.com', expect.anything())
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
