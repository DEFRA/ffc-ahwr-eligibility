const checkEligibility = require('./check-eligibility')
const updateWaiting = require('./update-waiting')
const processUnEligible = require('./process-un-eligible')

module.exports = {
  checkEligibility,
  updateWaiting,
  processUnEligible
}
