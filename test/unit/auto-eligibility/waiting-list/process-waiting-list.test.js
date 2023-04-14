const { when, resetAllWhenMocks } = require('jest-when')
const telemetryEvent = require('../../../../app/auto-eligibility/telemetry/telemetry-event')

const MOCK_NOW = new Date()

describe('Process waiting list function test.', () => {
  describe('When defraId is disabled', () => {
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

      jest.mock('../../../../app/auto-eligibility/config', () => ({
        defraId: {
          enabled: false
        }
      }))
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
          [
            {
              sbi: 'mock_sbi',
              crn: 'mock_crn',
              business_email: 'test@email.com',
              waiting_updated_at: MOCK_NOW,
              access_granted: true,
              last_updated_at: MOCK_NOW
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
        name: 'send-session-event',
        properties: {
          id: 'mock_sbi_mock_crn',
          sbi: 'mock_sbi',
          cph: 'n/a',
          checkpoint: 'mock_app_insights_cloud_role',
          status: 'success',
          action: {
            type: `auto-eligibility:${telemetryEvent.GAINED_ACCESS_TO_THE_APPLY_JOURNEY}`,
            message: 'The user has gained access to the apply journey',
            data: {
              crn: 'mock_crn',
              sbi: 'mock_sbi',
              businessEmail: 'test@email.com',
              onWaitingList: false,
              waitingUpdatedAt: MOCK_NOW,
              eligible: true,
              ineligibleReason: 'n/a',
              accessGranted: true,
              accessGrantedAt: MOCK_NOW
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
      expect(MOCK_SEND_EVENT).not.toHaveBeenCalled()
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
      expect(MOCK_SEND_EVENT).not.toHaveBeenCalled()
    })
  })
  describe('When defraId is enabled', () => {
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

      jest.mock('../../../../app/auto-eligibility/config', () => ({
        defraId: {
          enabled: true
        }
      }))
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
})
