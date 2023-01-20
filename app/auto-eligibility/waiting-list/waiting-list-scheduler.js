const cron = require('node-cron')
const config = require('../config')
const processWaitingList = require('./process-waiting-list')
const telemetryClient = require('../../app-insights/telemetry-client')

module.exports = {
  plugin: {
    name: 'waitingListScheduler',
    register: async () => {
      cron.schedule(config.waitingListScheduler.schedule, async () => {
        console.log(`${new Date().toISOString()} Running waiting list scheduler... ${JSON.stringify({
          ...config.waitingListScheduler
        })}`)
        try {
          await processWaitingList(config.waitingListScheduler.upperLimit)
          console.log(`${new Date().toISOString()} Waiting list has been processed`)
        } catch (error) {
          console.error(`${new Date().toISOString()} Error processing waiting list`, error)
          telemetryClient.trackException({
            exception: error
          })
        }
      }, {
        scheduled: config.waitingListScheduler.enabled
      })
    }
  }
}
