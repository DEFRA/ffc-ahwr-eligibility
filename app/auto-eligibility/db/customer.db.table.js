const { Op, literal } = require('sequelize')
const db = require('../../data')

const findByBusinessEmail = async (businessEmail) => {
  console.log(`Finding by business_email: ${JSON.stringify({ businessEmail })}`)
  return await db.customer.findOne({
    where: {
      business_email: businessEmail
    }
  })
}

const findAllBySbiOrBusinessEmail = async (sbi, businessEmail) => {
  console.log(`Finding all by sbi or business_email: ${JSON.stringify({ sbi, businessEmail })}`)
  const result = await db.customer.findAll({
    where: {
      [Op.or]: [
        { sbi: sbi },
        { business_email: businessEmail }
      ]
    }
  })
  console.log(`Found customers: ${JSON.stringify(result)}`)
  return result
}

const findAllByBusinessEmailAndAccessGranted = async (businessEmail, accessGranted) => {
  console.log(`Finding all by business_email and access_granted: ${JSON.stringify({ businessEmail, accessGranted })}`)
  return await db.customer.findAll({
    where: {
      [Op.and]: [
        { business_email: businessEmail },
        { access_granted: accessGranted }
      ]
    }
  })
}

const updateWaitingUpdatedAt = async (sbi, crn) => {
  const now = new Date()
  await db.customer.update({ waiting_updated_at: now, last_updated_at: now }, {
    lock: true,
    where: {
      sbi,
      crn
    }
  })
}

const updateAccessGranted = async (upperLimit) => {
  const waitingListQuery = `(SELECT sbi FROM customer WHERE waiting_updated_at IS NOT NULL AND access_granted = false ORDER BY waiting_updated_at ASC LIMIT ${upperLimit})`
  return await db.customer.update({ access_granted: true, last_updated_at: new Date() }, {
    lock: true,
    returning: true,
    where: {
      sbi: {
        [Op.in]: literal(waitingListQuery)
      }
    }
  })
}

module.exports = {
  findByBusinessEmail,
  findAllBySbiOrBusinessEmail,
  findAllByBusinessEmailAndAccessGranted,
  updateWaitingUpdatedAt,
  updateAccessGranted
}
