describe('notify Config Test', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('Should pass validation for all fields populated', async () => {
    const notifyConfig = require('../../../../app/config/notify')
    expect(notifyConfig).toBeDefined()
  })

  test('Invalid env var throws error', () => {
    try {
      process.env.NOTIFY_API_KEY = 'not a uuid'
      require('../../../../app/config/notify')
    } catch (err) {
      expect(err.message).toBe('The notify config is invalid. "apiKey" with value "not a uuid" fails to match the required pattern: /.*-[\\da-f]{8}\\b-[\\da-f]{4}\\b-[\\da-f]{4}\\b-[\\da-f]{4}\\b-[\\da-f]{12}-[\\da-f]{8}\\b-[\\da-f]{4}\\b-[\\da-f]{4}\\b-[\\da-f]{4}\\b-[\\da-f]{12}/')
    }
  })
})
