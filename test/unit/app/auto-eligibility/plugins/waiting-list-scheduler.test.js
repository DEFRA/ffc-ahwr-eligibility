describe('Waiting list plugin test', () => {
  test('test node cron executed', async () => {
    const mockNodeCron = require('node-cron')
    jest.mock('node-cron', () => {
      return {
        schedule: jest.fn()
      }
    })
    const waitingListScheduler = require('../../../../../app/auto-eligibility/plugins/waiting-list-scheduler')
    await waitingListScheduler.plugin.register()
    expect(mockNodeCron.schedule).toHaveBeenCalledTimes(1)
  })
})
