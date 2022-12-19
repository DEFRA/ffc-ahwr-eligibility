const autoEligibilityConfig = require('../../../../../app/config').autoEligibilityConfig

describe('autoEligiblityConfig Config Test', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('Should pass validation for all fields populated', async () => {
    expect(autoEligibilityConfig).toBeDefined()
  })

  test('Invalid env var throws error', () => {
    try {
      process.env.WAITING_LIST_TEMPLATE_ID = 'not a uuid'
      process.env.INELIGIBLE_GENERIC_TEMPLATE_ID = 'not a uuid'
      process.env.APPLY_INVITE_TEMPLATE_ID = 'not a uuid'
      require('../../../../../app/config')
    } catch (err) {
      expect(err.message).toBe('The auto eligibility configuration config is invalid. "emailTemplateIds.waitingList" must be a valid GUID. "emailTemplateIds.genericIneligible" must be a valid GUID. "emailTemplateIds.applyServiceInvite" must be a valid GUID')
    }
  })
})
