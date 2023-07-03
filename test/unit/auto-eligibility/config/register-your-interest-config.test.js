describe('register your interest config Test', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('Should pass validation for all fields populated', async () => {
    const ryiConfig = require('../../../../app/auto-eligibility/register-your-interest/register-your-interest.config')
    expect(ryiConfig).toBeDefined()
  })

  test('Invalid env var throws error', () => {
    try {
      process.env.MESSAGE_QUEUE_USER = 10
      require('../../../../app/auto-eligibility/register-your-interest/register-your-interest.config')
    } catch (err) {
      expect(err.message).toBe('The message queue config is invalid. "registerYourInterestRequestQueue.username" must be a string')
    }
  })
})
