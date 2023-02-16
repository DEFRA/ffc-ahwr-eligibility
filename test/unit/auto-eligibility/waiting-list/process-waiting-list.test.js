const { when, resetAllWhenMocks } = require('jest-when')

const MOCK_NOW = new Date()

describe('Process waiting list function test.', () => {
  let db
  let raiseEvent

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../app/app-insights/app-insights.config', () => ({
      appInsightsCloudRole: 'mock_app_insights_cloud_role'
    }))

    jest.mock('../../../../app/data')
    db = require('../../../../app/data')

    jest.mock('../../../../app/event/raise-event')
    raiseEvent = require('../../../../app/event/raise-event')
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
    when(db.sequelize.query)
      .calledWith(expect.anything(), expect.anything())
      .mockResolvedValue([
        [{ sbi: 'mock_sbi', crn: 'mock_crn', business_email: 'test@email.com' }, { business_email: 'test2@email.com' }, { business_email: 'test3@email.com' }], '3'
      ])
    const processWaitingList = require('../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} auto-eligibility:waiting-list Processing waiting list: ${JSON.stringify({ upperLimit: 50 })}`)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} auto-eligibility:waiting-list [3] new customers are now eligible to apply for a review`)
    expect(db.sequelize.query).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).toHaveBeenCalledTimes(3)
    expect(raiseEvent).toHaveBeenCalledTimes(3)
    expect(raiseEvent).toHaveBeenNthCalledWith(1, {
      name: 'send-session-event',
      properties: {
        id: 'mock_sbi_mock_crn',
        sbi: 'mock_sbi',
        cph: 'n/a',
        checkpoint: 'mock_app_insights_cloud_role',
        action: {
          type: 'eligible_to_apply_for_a_review',
          message: 'The customer is now eligible to apply for a review',
          data: {
            sbi: 'mock_sbi',
            crn: 'mock_crn',
            businessEmail: 'test@email.com'
          },
          raisedOn: MOCK_NOW,
          raisedBy: 'test@email.com'
        }
      }
    })
  })

  test('test no records updated', async () => {
    const spyConsole = jest.spyOn(console, 'log')
    jest.mock('../../../../app/auto-eligibility/email-notifier', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    const mockEmailNotifier = require('../../../../app/auto-eligibility/email-notifier')
    when(db.sequelize.query)
      .calledWith(expect.anything(), expect.anything())
      .mockResolvedValue([
        [], '0'
      ])
    const processWaitingList = require('../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} auto-eligibility:waiting-list Processing waiting list: ${JSON.stringify({ upperLimit: 50 })}`)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} auto-eligibility:waiting-list [0] new customers are now eligible to apply for a review`)
    expect(db.sequelize.query).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).not.toHaveBeenCalled()
    expect(raiseEvent).not.toHaveBeenCalled()
  })

  test('test error handled', async () => {
    jest.mock('../../../../app/auto-eligibility/email-notifier', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    const mockEmailNotifier = require('../../../../app/auto-eligibility/email-notifier')
    when(db.sequelize.query)
      .calledWith(expect.anything(), expect.anything())
      .mockRejectedValue(new Error('Some DB error'))
    const processWaitingList = require('../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    expect(async () =>
      await processWaitingList(50)
    ).rejects.toThrowError('Some DB error')
    expect(db.sequelize.query).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).not.toHaveBeenCalled()
    expect(raiseEvent).not.toHaveBeenCalled()
  })
})
