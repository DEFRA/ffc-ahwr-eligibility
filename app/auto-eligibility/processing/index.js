const checkEligibility = require('./check-eligibility')
const processEligible = require('./process-eligible')
const processIneligible = require('./process-ineligible')
const updateAccessGranted = require('./update-access-granted')

module.exports = {
  checkEligibility,
  processEligible,
  processIneligible,
  updateAccessGranted
}
