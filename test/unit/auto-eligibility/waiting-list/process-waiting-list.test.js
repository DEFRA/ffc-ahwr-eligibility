const { when, resetAllWhenMocks } = require('jest-when')
const telemetryEvent = require('../../../../app/auto-eligibility/telemetry/telemetry-event')

const MOCK_NOW = new Date()

describe('Process waiting list function test.', () => {
  let db
  const MOCK_SEND_EVENT = jest.fn()

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../../app/app-insights/app-insights.config', () => ({
      appInsightsCloudRole: 'mock_app_insights_cloud_role'
    }))

    jest.mock('../../../../app/data')
    db = require('../../../../app/data')

    jest.mock('ffc-ahwr-event-publisher', () => {
      return {
        PublishEvent: jest.fn().mockImplementation(() => {
          return {
            sendEvent: MOCK_SEND_EVENT
          }
        })
      }
    })
  })

  afterAll(() => {
    jest.resetModules()
    jest.useRealTimers()
  })

  afterEach(() => {
    resetAllWhenMocks()
    jest.clearAllMocks()
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
        [
          {
            business_email: 'test@email.com',
            created_at: MOCK_NOW,
            access_granted: true,
            access_granted_at: MOCK_NOW
          },
          { business_email: 'test2@email.com' }, { business_email: 'test3@email.com' }], '3'
      ])
    const processWaitingList = require('../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} auto-eligibility:waiting-list Processing waiting list: ${JSON.stringify({ upperLimit: 50 })}`)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} auto-eligibility:waiting-list [3] new customers are now eligible to apply for a review`)
    expect(db.sequelize.query).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).toHaveBeenCalledTimes(3)
    expect(MOCK_SEND_EVENT).toHaveBeenCalledTimes(3)
    expect(MOCK_SEND_EVENT).toHaveBeenNthCalledWith(1, {
      name: 'register-your-interest-event',
      properties: {
        id: 'test@email.com',
        sbi: 'n/a',
        cph: 'n/a',
        checkpoint: 'mock_app_insights_cloud_role',
        status: 'success',
        action: {
          type: telemetryEvent.GAINED_ACCESS_TO_THE_APPLY_JOURNEY,
          message: 'The user has gained access to the apply journey',
          data: {
            businessEmail: 'test@email.com',
            accessGranted: true,
            accessGrantedAt: MOCK_NOW,
            createdAt: MOCK_NOW
          },
          raisedBy: 'test@email.com'
        }
      }
    })
  })

  test('test one record updated', async () => {
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
        [
          {
            business_email: 'test@email.com',
            created_at: MOCK_NOW,
            access_granted: true,
            access_granted_at: MOCK_NOW
          }], '1'
      ])
    const processWaitingList = require('../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} auto-eligibility:waiting-list Processing waiting list: ${JSON.stringify({ upperLimit: 50 })}`)
    expect(spyConsole).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} auto-eligibility:waiting-list [1] new customer are now eligible to apply for a review`)
    expect(db.sequelize.query).toHaveBeenCalledTimes(1)
    expect(mockEmailNotifier.sendApplyGuidanceEmail).toHaveBeenCalledTimes(1)
    expect(MOCK_SEND_EVENT).toHaveBeenCalledTimes(1)
    expect(MOCK_SEND_EVENT).toHaveBeenNthCalledWith(1, {
      name: 'register-your-interest-event',
      properties: {
        id: 'test@email.com',
        sbi: 'n/a',
        cph: 'n/a',
        checkpoint: 'mock_app_insights_cloud_role',
        status: 'success',
        action: {
          type: telemetryEvent.GAINED_ACCESS_TO_THE_APPLY_JOURNEY,
          message: 'The user has gained access to the apply journey',
          data: {
            businessEmail: 'test@email.com',
            accessGranted: true,
            accessGrantedAt: MOCK_NOW,
            createdAt: MOCK_NOW
          },
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
    expect(MOCK_SEND_EVENT).toHaveBeenCalledTimes(0)
  })

  test('test upper limit not defined', async () => {
    jest.mock('../../../../app/auto-eligibility/email-notifier', () => {
      return {
        sendApplyGuidanceEmail: jest.fn()
      }
    })
    const mockEmailNotifier = require('../../../../app/auto-eligibility/email-notifier')
    const processWaitingList = require('../../../../app/auto-eligibility/waiting-list/process-waiting-list')
    expect(async () =>
      await processWaitingList(undefined)
    ).rejects.toThrowError('Invalid argument: undefined')
    expect(db.sequelize.query).not.toHaveBeenCalled()
    expect(mockEmailNotifier.sendApplyGuidanceEmail).not.toHaveBeenCalled()
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
  })
})
