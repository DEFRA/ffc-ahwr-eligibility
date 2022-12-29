let autoEligibilityConfig

describe('autoEligiblityConfig Config Test', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    process.env.APPLY_SERVICE_URI = 'http://localhost:3000/apply'
    autoEligibilityConfig = require('../../../../../app/config').autoEligibilityConfig
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('Should pass validation for all fields populated', async () => {
    expect(autoEligibilityConfig).toBeDefined()
  })

  test('Invalid env var throws error', () => {
    try {
      process.env.NOTIFY_TEMPLATE_ID_WAITING_LIST = 'not a uuid'
      process.env.NOTIFY_TEMPLATE_ID_INELIGIBLE_GENERIC = 'not a uuid'
      process.env.NOTIFY_TEMPLATE_ID_APPLY_INVITE = 'not a uuid'
      require('../../../../../app/config')
    } catch (err) {
      expect(err.message).toBe('The auto eligibility configuration config is invalid. "emailTemplateIds.waitingList" must be a valid GUID. "emailTemplateIds.genericIneligible" must be a valid GUID. "emailTemplateIds.applyServiceInvite" must be a valid GUID')
    }
  })
})
