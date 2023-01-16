let notifyConfig

describe('notifyConfig Config Test', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    jest.mock('../../../app/auto-eligibility/config', () => {})
    notifyConfig = require('../../../app/config').notifyConfig
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('Should pass validation for all fields populated', async () => {
    expect(notifyConfig).toBeDefined()
  })

  test('Invalid env var throws error', () => {
    try {
      process.env.NOTIFY_API_KEY = null
      require('../../../app/config')
    } catch (err) {
      expect(err.message).toBe('The notify config is invalid. "apiKey" must be a string')
    }
  })
})
