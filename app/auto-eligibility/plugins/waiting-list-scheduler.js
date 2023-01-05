const cron = require('node-cron')
const config = require('../config')
const processWaitingList = require('../lib/process-waiting-list')
const logger = require('../../logger')

module.exports = {
  plugin: {
    name: 'waitingListScheduler',
    register: async () => {
      cron.schedule(config.waitingListScheduler.schedule, async () => {
        logger.logTrace('Running waiting list scheduler with config', {
          scheduler: config.waitingListScheduler
        })
        await processWaitingList(config.waitingListScheduler.upperLimit)
      }, {
        scheduled: config.waitingListScheduler.enabled
      })
    }
  }
}
