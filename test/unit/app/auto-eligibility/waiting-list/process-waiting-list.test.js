const { when, resetAllWhenMocks } = require('jest-when')

describe('Process waiting list function test.', () => {
  let db

  beforeAll(() => {
    jest.mock('../../../../../app/data')
    db = require('../../../../../app/data')
  })

  afterAll(() => {
    jest.resetModules()
  })

  afterEach(() => {
    resetAllWhenMocks()
    jest.resetAllMocks()
  })

  test('test mulitple records updated', async () => {
    const spyConsole = jest.spyOn(console, 'log')
    jest.mock('../../../../../app/auto-eligibility/email-notifier', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    const mockEmailNotifier = require('../../../../../app/auto-eligibility/email-notifier')
    when(db.customer.update)
      .calledWith(expect.anything(), expect.anything())
      .mockResolvedValue([
        '3', [{ business_email: 'test@email.com' }, { business_email: 'test2@email.com' }, { business_email: 'test3@email.com' }]
      ])
    const processWaitingList = require('../../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith('Executing process waiting list with limit of 50.')
    expect(spyConsole).toHaveBeenCalledWith('3 farmers moved from the waiting list.')
    expect(db.customer.update).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).toHaveBeenCalledTimes(3)
  })

  test('test no records updated', async () => {
    const spyConsole = jest.spyOn(console, 'log')
    jest.mock('../../../../../app/auto-eligibility/email-notifier', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    const mockEmailNotifier = require('../../../../../app/auto-eligibility/email-notifier')
    when(db.customer.update)
      .calledWith(expect.anything(), expect.anything())
      .mockResolvedValue([
        '0', []
      ])
    const processWaitingList = require('../../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith('Executing process waiting list with limit of 50.')
    expect(spyConsole).toHaveBeenCalledWith('0 farmers moved from the waiting list.')
    expect(db.customer.update).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).not.toHaveBeenCalled()
  })

  test('test error handled', async () => {
    const spyConsole = jest.spyOn(console, 'error')
    jest.mock('../../../../../app/auto-eligibility/email-notifier', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    const mockEmailNotifier = require('../../../../../app/auto-eligibility/email-notifier')
    when(db.customer.update)
      .calledWith(expect.anything(), expect.anything())
      .mockRejectedValue(new Error('Some DB error'))
    const processWaitingList = require('../../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith('Error processing waiting list.', expect.anything())
    expect(db.customer.update).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).not.toHaveBeenCalled()
  })
})
