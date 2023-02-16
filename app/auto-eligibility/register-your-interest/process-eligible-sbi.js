const emailNotifier = require('../email-notifier')
const customerDbTable = require('../db/customer.db.table')
const { selectYourBusiness } = require('../config/index.js')
const raiseEvent = require('../../event/raise-event')
const appInsightsConfig = require('../../app-insights/app-insights.config')

const processEligibleSbi = async (customer) => {
  console.log(`${new Date().toISOString()} Processing eligible SBI: ${JSON.stringify({
     customer,
     selectYourBusinessEnabled: selectYourBusiness.enabled
  })}`)
  if (selectYourBusiness.enabled) {
    await customerDbTable.updateWaitingUpdatedAt(customer.sbi, customer.crn)
    await emailNotifier.sendWaitingListEmail(customer.businessEmail)
    await raiseEvent({
      name: 'auto-eligibility:incoming-register-your-interest:recognised_as_eligible',
      properties: {
        id: `${customer.sbi}_${customer.crn}`,
        sbi: customer.sbi,
        cph: 'n/a',
        checkpoint: appInsightsConfig.appInsightsCloudRole,
        status: 'SUCCESS',
        action: {
          type: 'put_on_the_waiting_list',
          message: 'The customer has been put on the waiting list',
          data: {
            customer: {
              sbi: customer.sbi,
              crn: customer.crn,
              businessEmail: customer.businessEmail
            }
          },
          raisedOn: new Date(),
          raisedBy: 'auto-eligibility:incoming-register-your-interest'
        }
      }
    })
  } else {
    if (customer.businessEmailHasMultipleDistinctSbi) {
      console.log(`${new Date().toISOString()} The customer's business email has multiple distinct SBI`)
      await raiseEvent({
        name: 'auto-eligibility:incoming-register-your-interest:rejected_due_to_multiple_sbi',
        properties: {
          id: `${customer.sbi}_${customer.crn}`,
          sbi: customer.sbi,
          cph: 'n/a',
          checkpoint: appInsightsConfig.appInsightsCloudRole,
          status: 'SUCCESS',
          action: {
            type: 'rejected_due_to_multiple_sbi',
            message: 'Rejected due to multiple SBI numbers',
            data: {
              customer: {
                sbi: customer.sbi,
                crn: customer.crn,
                businessEmail: customer.businessEmail
              }
            },
            raisedOn: new Date(),
            raisedBy: 'auto-eligibility:incoming-register-your-interest'
          }
        }
      })
      return await emailNotifier.sendIneligibleApplicationEmail(
        customer.sbi,
        customer.crn,
        customer.businessEmail
      )
    }
    await customerDbTable.updateWaitingUpdatedAt(customer.sbi, customer.crn)
    await emailNotifier.sendWaitingListEmail(customer.businessEmail)
    await raiseEvent({
      name: 'auto-eligibility:incoming-register-your-interest:recognised_as_eligible',
      properties: {
        id: `${customer.sbi}_${customer.crn}`,
        sbi: customer.sbi,
        cph: 'n/a',
        checkpoint: appInsightsConfig.appInsightsCloudRole,
        status: 'SUCCESS',
        action: {
          type: 'put_on_the_waiting_list',
          message: 'The customer has been put on the waiting list',
          data: {
            customer: {
              sbi: customer.sbi,
              crn: customer.crn,
              businessEmail: customer.businessEmail
            }
          },
          raisedOn: new Date(),
          raisedBy: 'auto-eligibility:incoming-register-your-interest'
        }
      }
    })
  }
}

module.exports = processEligibleSbi
