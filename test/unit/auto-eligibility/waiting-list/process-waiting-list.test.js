const { when, resetAllWhenMocks } = require('jest-when')

const MOCK_NOW = new Date()

describe('Process waiting list function test.', () => {
  let db

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../app/data')
    db = require('../../../../app/data')
  })

  afterAll(() => {
    jest.resetModules()
    jest.useRealTimers()
  })

  afterEach(() => {
    resetAllWhenMocks()
    jest.resetAllMocks()
  })

  test('test mulitple records updated', async () => {
    const spyConsole = jest.spyOn(console, 'log')
    jest.mock('../../../../app/auto-eligibility/email-notifier', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    const mockEmailNotifier = require('../../../../app/auto-eligibility/email-notifier')
    when(db.customer.update)
      .calledWith(expect.anything(), expect.anything())
      .mockResolvedValue([
        '3', [{ business_email: 'test@email.com' }, { business_email: 'test2@email.com' }, { business_email: 'test3@email.com' }]
      ])
    const processWaitingList = require('../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} Processing waiting list: ${JSON.stringify({upperLimit: 50 })}`)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} 3 customers moved from the waiting list.`)
    expect(db.customer.update).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).toHaveBeenCalledTimes(3)
  })

  test('test no records updated', async () => {
    const spyConsole = jest.spyOn(console, 'log')
    jest.mock('../../../../app/auto-eligibility/email-notifier', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    const mockEmailNotifier = require('../../../../app/auto-eligibility/email-notifier')
    when(db.customer.update)
      .calledWith(expect.anything(), expect.anything())
      .mockResolvedValue([
        '0', []
      ])
    const processWaitingList = require('../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} Processing waiting list: ${JSON.stringify({upperLimit: 50 })}`)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} 0 customers moved from the waiting list.`)
    expect(db.customer.update).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).not.toHaveBeenCalled()
  })

  test('test error handled', async () => {
    jest.mock('../../../../app/auto-eligibility/email-notifier', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    const mockEmailNotifier = require('../../../../app/auto-eligibility/email-notifier')
    when(db.customer.update)
      .calledWith(expect.anything(), expect.anything())
      .mockRejectedValue(new Error('Some DB error'))
    const processWaitingList = require('../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    expect(async () =>
      await processWaitingList(50)
    ).rejects.toThrowError('Some DB error')
    expect(db.customer.update).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).not.toHaveBeenCalled()
  })
})
