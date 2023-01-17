const { Op, literal, fn, col, where } = require('sequelize')
const db = require('../../data')

const findByBusinessEmail = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Finding by business_email: ${JSON.stringify({ businessEmail })}`)
  return await db.customer.findOne({
    attributes: [
      'sbi',
      'crn',
      'customer_name',
      'business_name',
      [fn('LOWER', col('business_email')), 'business_email'],
      'business_address',
      'last_updated_at',
      'waiting_updated_at',
      'access_granted'
    ],
    where: {
      business_email: where(fn('LOWER', col('business_email')), businessEmail)
    }
  })
}

const findAllBySbiOrBusinessEmail = async (sbi, businessEmail) => {
  console.log(`${new Date().toISOString()} Finding all by sbi or business_email: ${JSON.stringify({ sbi, businessEmail })}`)
  const result = await db.customer.findAll({
    attributes: [
      'sbi',
      'crn',
      'customer_name',
      'business_name',
      [fn('LOWER', col('business_email')), 'business_email'],
      'business_address',
      'last_updated_at',
      'waiting_updated_at',
      'access_granted'
    ],
    where: {
      [Op.or]: [
        { sbi: sbi },
        { business_email: where(fn('LOWER', col('business_email')), businessEmail) }
      ]
    }
  })
  console.log(`${new Date().toISOString()} Found customers: ${JSON.stringify(result)}`)
  return result
}

const findAllByBusinessEmailAndAccessGranted = async (businessEmail, accessGranted) => {
  console.log(`${new Date().toISOString()} Finding all by business_email and access_granted: ${JSON.stringify({ businessEmail, accessGranted })}`)
  return await db.customer.findAll({
    attributes: [
      'sbi',
      'crn',
      'customer_name',
      'business_name',
      [fn('LOWER', col('business_email')), 'business_email'],
      'business_address',
      'last_updated_at',
      'waiting_updated_at',
      'access_granted'
    ],
    where: {
      [Op.and]: [
        { business_email: where(fn('LOWER', col('business_email')), businessEmail) },
        { access_granted: accessGranted }
      ]
    }
  })
}

const updateWaitingUpdatedAt = async (sbi, crn) => {
  console.log(`${new Date().toISOString()} Updating waiting updated at: ${JSON.stringify({ sbi, crn })}`)
  const now = new Date()
  await db.customer.update({ waiting_updated_at: now, last_updated_at: now }, {
    lock: true,
    attributes: [
      'sbi',
      'crn',
      'customer_name',
      'business_name',
      [fn('LOWER', col('business_email')), 'business_email'],
      'business_address',
      'last_updated_at',
      'waiting_updated_at',
      'access_granted'
    ],
    where: {
      sbi,
      crn
    }
  })
}

const updateAccessGranted = async (upperLimit) => {
  console.log(`${new Date().toISOString()} Updating access granted: ${JSON.stringify({ upperLimit })}`)
  if (typeof upperLimit === 'undefined') {
    throw new Error(`Invalid argument: ${JSON.stringify(upperLimit)}`)
  }
  return await db.customer.update({ access_granted: true, last_updated_at: new Date() }, {
    lock: true,
    returning: true,
    attributes: [
      'sbi',
      'crn',
      'customer_name',
      'business_name',
      [fn('LOWER', col('business_email')), 'business_email'],
      'business_address',
      'last_updated_at',
      'waiting_updated_at',
      'access_granted'
    ],
    where: {
      crn: {
        [Op.in]: literal(`(
          SELECT crn 
          FROM customer 
          WHERE waiting_updated_at IS NOT NULL AND access_granted = false 
          ORDER BY waiting_updated_at ASC 
          LIMIT ${upperLimit}
        )`)
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
