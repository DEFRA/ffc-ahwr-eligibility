const autoEligiblityConfig = require('../../../../../app/config').autoEligiblityConfig

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
    expect(autoEligiblityConfig).toBeDefined()
  })

  test('Invalid env var throws error', () => {
    try {
      process.env.WAITING_LIST_TEMPLATE_ID_ = null
      process.env.INELIGIBLE_GENERIC_TEMPLATE_ID = 'someId'
      process.env.APPLY_INVITE_TEMPLATE_ID = 'someId'
      require('../../../../../app/config')
    } catch (err) {
      expect(err.message).toBe('The auto eligibility configuration config is invalid. "emailTemplateIds.waitingList" must be a string. "emailTemplateIds.genericIneligible" must be a valid GUID. "emailTemplateIds.applyServiceInvite" must be a valid GUID')
    }
  })
})
