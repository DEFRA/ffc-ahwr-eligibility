describe('Process waiting list function test.', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
  })

  test('test mulitple records updated', async () => {
    const spyConsole = jest.spyOn(console, 'log')
    jest.mock('../../../../../app/auto-eligibility/email', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    jest.mock('../../../../../app/auto-eligibility/processing/update-access-granted', () => jest.fn())
    const updateAccessGranted = require('../../../../../app/auto-eligibility/processing/update-access-granted')
    const mockEmailNotifier = require('../../../../../app/auto-eligibility/email')
    updateAccessGranted.mockResolvedValue([
      '3', [{ business_email: 'test@email.com' }, { business_email: 'test2@email.com' }, { business_email: 'test3@email.com' }]
    ])
    const processWaitingList = require('../../../../../app/auto-eligibility/lib/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith('Executing process waiting list with limit of 50.')
    expect(spyConsole).toHaveBeenCalledWith('3 farmers moved from the waiting list.')
    expect(updateAccessGranted).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).toHaveBeenCalledTimes(3)
  })

  test('test no records updated', async () => {
    const spyConsole = jest.spyOn(console, 'log')
    jest.mock('../../../../../app/auto-eligibility/email', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    jest.mock('../../../../../app/auto-eligibility/processing/update-access-granted', () => jest.fn())
    const updateAccessGranted = require('../../../../../app/auto-eligibility/processing/update-access-granted')
    const mockEmailNotifier = require('../../../../../app/auto-eligibility/email')
    updateAccessGranted.mockResolvedValue([
      '0', []
    ])
    const processWaitingList = require('../../../../../app/auto-eligibility/lib/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith('Executing process waiting list with limit of 50.')
    expect(spyConsole).toHaveBeenCalledWith('0 farmers moved from the waiting list.')
    expect(updateAccessGranted).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).not.toHaveBeenCalled()
  })

  test('test error handled', async () => {
    const spyConsole = jest.spyOn(console, 'error')
    jest.mock('../../../../../app/auto-eligibility/email', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    jest.mock('../../../../../app/auto-eligibility/processing/update-access-granted', () => jest.fn())
    const updateAccessGranted = require('../../../../../app/auto-eligibility/processing/update-access-granted')
    const mockEmailNotifier = require('../../../../../app/auto-eligibility/email')
    updateAccessGranted.mockRejectedValue(new Error('Some DB error'))
    const processWaitingList = require('../../../../../app/auto-eligibility/lib/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith('Error processing waiting list.', expect.anything())
    expect(updateAccessGranted).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).not.toHaveBeenCalled()
  })
})
