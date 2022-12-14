const cron = require('node-cron')
const config = require('../config')
const processWaitingList = require('../lib/process-waiting-list')

module.exports = {
  plugin: {
    name: 'waitingListScheduler',
    register: async () => {
      cron.schedule(config.waitingListScheduler.schedule, async () => {
        console.log(`Running waiting list scheduler with config - ${JSON.stringify(config.waitingListScheduler)}.`)
        await processWaitingList(config.waitingListScheduler.upperLimit)
      }, {
        scheduled: config.waitingListScheduler.enabled
      })
    }
  }
}
