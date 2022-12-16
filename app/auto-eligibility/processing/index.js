const checkEligibility = require('./check-eligibility')
const updateWaiting = require('./update-waiting')
const processIneligible = require('./process-ineligible')

module.exports = {
  checkEligibility,
  updateWaiting,
  processIneligible
}
