describe('Process waiting list function test.', () => {

  beforeAll(() => {
    jest.resetModules()
    jest.resetAllMocks()
  })

  test('test function executed', async () => {
    const spyConsole = jest.spyOn(console, 'log')
    const updateAccessGranted = require('../../../../../app/auto-eligibility/processing/update-access-granted')
    const sendApplyGuidanceEmail = require('../../../../../app/auto-eligibility/email').sendApplyGuidanceEmail
    const sendEmail = require('../../../../../app/lib/send-email')
    jest.mock('../../../../../app/lib/send-email')
    jest.mock('../../../../../app/auto-eligibility/email')
    jest.mock('../../../../../app/auto-eligibility/processing/update-access-granted')
    updateAccessGranted.mockResolvedValue([
      '0', {'foo': 'bar'}
    ])
    const { processWaitingList } = require('../../../../../app/auto-eligibility/lib/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith('Executing process waiting list with limit of 50.')
  })
})
