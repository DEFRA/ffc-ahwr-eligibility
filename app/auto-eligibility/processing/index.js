const checkEligibility = require('./check-eligibility')
const processEligibleCustomer = require('./process-eligible-customer')
const processIneligibleCustomer = require('./process-ineligible-customer')
const updateAccessGranted = require('./update-access-granted')

module.exports = {
  checkEligibility,
  processEligibleCustomer,
  processIneligibleCustomer,
  updateAccessGranted
}
