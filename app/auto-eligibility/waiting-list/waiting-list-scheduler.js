const cron = require('node-cron')
const config = require('../config')
const processWaitingList = require('./process-waiting-list')

module.exports = {
  plugin: {
    name: 'waitingListScheduler',
    register: async () => {
      cron.schedule(config.waitingListScheduler.schedule, async () => {
        console.log(`${new Date().toISOString()} Running waiting list scheduler... ${JSON.stringify({ schedule: config.waitingListScheduler })}`)
        await processWaitingList(config.waitingListScheduler.upperLimit)
      }, {
        scheduled: config.waitingListScheduler.enabled
      })
    }
  }
}
