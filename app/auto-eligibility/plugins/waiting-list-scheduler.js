const cron = require('node-cron')
const config = require('../config')
<<<<<<< HEAD
const { processWaitingList } = require('../lib/process-waiting-list')
=======
const processWaitingList = require('../lib/process-waiting-list')
>>>>>>> 2a5e346 (Added cron scheduler for waiting list functionality)

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
