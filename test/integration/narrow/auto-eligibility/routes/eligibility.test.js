describe('Eligibility Api - /api/eligibility', () => {
  const server = require('../../../../../app/server/server')

  const URL = '/api/eligibility'

  beforeAll(async () => {
    jest.resetAllMocks()
    await server.start()
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('GET', () => {
    test.each([
      {
        emailAddress: 'name@email.com'
      }
    ])('Returns whether a given farmer\'s email address has been flagged as eligible', async (testCase) => {
      const options = {
        method: 'GET',
        url: `${URL}?emailAddress=${testCase.emailAddress}`
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(200)
      expect(payload).toEqual({
        farmerName: 'David Smith',
        name: 'David\'s Farm',
        sbi: '441111114',
        cph: '44/333/1112',
        address: 'Some Road, London, MK55 7ES',
        email: 'name@email.com'
      })
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
        url: `${URL}${testCase.queryString}`
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(400)
      expect(response.statusMessage).toEqual('Bad Request')
      expect(payload.message).toEqual('A valid email address must be specified.')
    })
  })
})
