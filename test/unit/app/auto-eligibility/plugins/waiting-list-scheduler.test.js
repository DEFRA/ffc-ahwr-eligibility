describe('Waiting list plugin test', () => {
  const OLD_ENV = process.env

  beforeEach(async () => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('test node cron executed', async () => {
    process.env.WAITING_LIST_SCHEDULE = '0 9 * * FRI'
    const mockNodeCron = require('node-cron')
    jest.mock('node-cron', () => {
      return {
        schedule: jest.fn()
      }
    })
    jest.mock('../../../../../app/auto-eligibility/lib/process-waiting-list', () => jest.fn())
    require('../../../../../app/auto-eligibility/lib/process-waiting-list')
    const waitingListScheduler = require('../../../../../app/auto-eligibility/plugins/waiting-list-scheduler')
    await waitingListScheduler.plugin.register()
    expect(mockNodeCron.schedule).toHaveBeenCalledWith(
      '0 9 * * FRI', expect.any(Function), { scheduled: true }
    )
  })

  test('test proccess waiting list called', async () => {
    process.env.WAITING_LIST_THRESHOLD_UPPER_LIMIT = '50'
    const mockNodeCron = require('node-cron')
    jest.mock('node-cron', () => {
      return {
        schedule: jest.fn()
      }
    })
    jest.mock('../../../../../app/auto-eligibility/lib/process-waiting-list', () => jest.fn())
    const processWaitingList = require('../../../../../app/auto-eligibility/lib/process-waiting-list')
    mockNodeCron.schedule.mockImplementationOnce(async (frequency, callback) => await callback())
    const waitingListScheduler = require('../../../../../app/auto-eligibility/plugins/waiting-list-scheduler')
    await waitingListScheduler.plugin.register()
    expect(processWaitingList).toHaveBeenCalledWith(50)
  })
})
