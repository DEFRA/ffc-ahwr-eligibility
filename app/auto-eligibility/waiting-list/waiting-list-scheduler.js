const cron = require('node-cron')
const config = require('../config')
const processWaitingList = require('./process-waiting-list')
const telemetryClient = require('../../app-insights/telemetry-client')

module.exports = {
  plugin: {
    name: 'waitingListScheduler',
    register: async () => {
      console.log(`${new Date().toISOString()} auto-eligibility:waiting-list Running waiting list scheduler... ${JSON.stringify(
        config.waitingListScheduler
      )}`)
      cron.schedule(config.waitingListScheduler.schedule, async () => {
        console.log(`${new Date().toISOString()} auto-eligibility:waiting-list Waiting list is about to be processed`)
        try {
          await processWaitingList(config.waitingListScheduler.upperLimit)
          console.log(`${new Date().toISOString()} auto-eligibility:waiting-list Waiting list has been processed`)
        } catch (error) {
          console.error(`${new Date().toISOString()} auto-eligibility:waiting-list Error while processing waiting list`, error)
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
