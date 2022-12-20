const db = require('../../data')
const sequelize = require('sequelize')
const upperLimit = require('../../auto-eligibility/config').waitingListScheduler.upperLimit
const waitingListQuery = `(SELECT sbi FROM eligibility WHERE waiting_updated_at IS NOT NULL AND access_granted = false ORDER BY waiting_updated_at ASC LIMIT ${upperLimit})`

const updateAccessGranted = async () => {
  return await db.eligibility.update({ access_granted: true, last_updated_at: new Date() }, {
    lock: true,
    returning: true,
    where: {
      sbi: {
        [sequelize.Op.in]: sequelize.literal(waitingListQuery)
      }
    }
  })
}

module.exports = updateAccessGranted
