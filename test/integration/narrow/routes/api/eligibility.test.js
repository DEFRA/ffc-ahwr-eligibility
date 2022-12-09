const { query } = require('@hapi/hapi/lib/validation')

describe('Eligibility Api - /api/eligibility', () => {
  const server = require('../../../../../app/server')

  const URL = `/api/eligibility`

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
        url: `${URL}?emailAddress=${testCase.emailAddress}`,
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(200)
      expect(payload).toEqual({
        eligible: true
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
        url: `${URL}${testCase.queryString}`,
      }

      const response = await server.inject(options)
      const payload = JSON.parse(response.payload)

      expect(response.statusCode).toBe(400)
      expect(response.statusMessage).toEqual('Bad Request')
      expect(payload.message).toEqual('A valid email address must be specified.')
    })
  })
})
