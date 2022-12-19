const updateWaiting = require('./update-waiting')
const processEligible = async (sbi, crn) => {
  await updateWaiting(sbi, crn)
}

module.exports = processEligible
