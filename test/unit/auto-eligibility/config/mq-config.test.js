describe('mq Config Test', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('Should pass validation for all fields populated', async () => {
    const mqConfig = require('../../../../app/config/messaging')
    expect(mqConfig).toBeDefined()
  })

  test('Invalid env var throws error', () => {
    try {
      process.env.MESSAGE_QUEUE_USER = 50
      require('../../../../app/config/messaging')
    } catch (err) {
      expect(err.message).toBe('The message queue config is invalid. "messageQueue.username" must be a string')
    }
  })
})
