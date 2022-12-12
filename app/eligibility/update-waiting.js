const db = require('../data')

const updateWaiting = async (sbi, crn) => {
  await db.eligibility.update({ waiting_updated_at: new Date() }, {
    lock: true,
    where: {
      sbi,
      crn
    }
  })
}

module.exports = updateWaiting
