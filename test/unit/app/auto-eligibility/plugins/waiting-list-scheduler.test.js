describe('Waiting list plugin test', () => {
<<<<<<< HEAD
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
=======
  test('test node cron executed', async () => {
>>>>>>> 2a5e346 (Added cron scheduler for waiting list functionality)
    const mockNodeCron = require('node-cron')
    jest.mock('node-cron', () => {
      return {
        schedule: jest.fn()
      }
    })
    const waitingListScheduler = require('../../../../../app/auto-eligibility/plugins/waiting-list-scheduler')
    await waitingListScheduler.plugin.register()
<<<<<<< HEAD
    expect(mockNodeCron.schedule).toHaveBeenCalledWith(
      '0 9 * * FRI', expect.any(Function), { scheduled: true }
    )
  })

  test('test proccess waiting list called', async () => {
    const mockNodeCron = require('node-cron')
    jest.mock('node-cron', () => {
      return {
        schedule: jest.fn()
      }
    })
    const mockProcessWaitingList = require('../../../../../app/auto-eligibility/lib/process-waiting-list')
    jest.spyOn(mockProcessWaitingList, 'processWaitingList')
    const consoleLogSpy = jest.spyOn(console, 'log')
    mockNodeCron.schedule.mockImplementationOnce(async (frequency, callback) => await callback())
    const waitingListScheduler = require('../../../../../app/auto-eligibility/plugins/waiting-list-scheduler')
    await waitingListScheduler.plugin.register()
    expect(mockProcessWaitingList.processWaitingList).toHaveBeenCalledWith(50)
    expect(consoleLogSpy).toHaveBeenCalledWith('Executing process waiting list with limit of 50.')
=======
    expect(mockNodeCron.schedule).toHaveBeenCalledTimes(1)
>>>>>>> 2a5e346 (Added cron scheduler for waiting list functionality)
  })
})
