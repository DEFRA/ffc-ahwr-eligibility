const registerYourInterestConfig = require('../../../../app/config').registerYourInterestConfig

describe('RegisterYourInterestConfig Config Test', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('Should pass validation for all fields populated', async () => {
    expect(registerYourInterestConfig).toBeDefined()
  })

  test('Invalid env var throws error', () => {
    try {
      process.env.REGISTER_YOUR_INTEREST_REQUEST_QUEUE_ADDRESS = null
      require('../../../../app/config')
    } catch (err) {
      expect(err.message).toBe('The message queue config is invalid. "registerYourInterestRequestQueue.address" must be a string')
    }
  })
})
