describe('autoEligibilityConfig Config Test', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('Should pass validation for all fields populated', async () => {
    const autoEligibilityConfig = require('../../../../app/auto-eligibility/config')
    expect(autoEligibilityConfig).toBeDefined()
  })

  test('Invalid env var throws error', () => {
    try {
      process.env.NOTIFY_TEMPLATE_ID_WAITING_LIST = 'not a uuid'
      require('../../../../app/auto-eligibility/config')
    } catch (err) {
      expect(err.message).toBe('The auto eligibility configuration config is invalid. "emailTemplateIds.waitingList" must be a valid GUID')
    }
  })
})
