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
      process.env.NOTIFY_TEMPLATE_ID_WAITING_LIST = null
      process.env.NOTIFY_TEMPLATE_ID_INELIGIBLE_GENERIC = 'someId'
      process.env.NOTIFY_TEMPLATE_ID_APPLY_INVITE = 'someId'
      require('../../../../../app/config')
    } catch (err) {
      expect(err.message).toBe('The auto eligibility configuration config is invalid. "emailTemplates.waitingList" must be a string. "emailTemplates.genericIneligible" must be a valid GUID. "emailTemplates.applyServiceInvite" must be a valid GUID')
    }
  })
})
