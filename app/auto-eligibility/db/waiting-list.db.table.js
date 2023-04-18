const { fn, col, where, QueryTypes } = require('sequelize')
const db = require('../../data')

const findAllByBusinessEmail = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Finding all by business_email: ${JSON.stringify({ businessEmail })}`)
  const result = await db.waiting_list.findAll({
    attributes: [
      [fn('LOWER', col('business_email')), 'business_email'],
      'created_at',
      'access_granted',
      'access_granted_at'
    ],
    where: {
      business_email: where(fn('LOWER', col('business_email')), businessEmail)
    }
  })
  console.log(`${new Date().toISOString()} Found customers: ${JSON.stringify(result)}`)
  return result
}

const registerInterest = async (businessEmail) => {
  console.log(`${new Date().toISOString()} Registering interest for business email: ${JSON.stringify({ businessEmail })}`)
  const result = await db.waiting_list.create({
    business_email: businessEmail,
    created_at: new Date(),
    access_granted: false,
    access_granted_at: null
  })
  console.log(`${new Date().toISOString()} Registered interest for business email: ${JSON.stringify(result)}`)
  return result
}

const updateAccessGranted = async (upperLimit) => {
  console.log(`${new Date().toISOString()} Updating access granted: ${JSON.stringify({ upperLimit })}`)
  if (typeof upperLimit === 'undefined') {
    throw new Error(`Invalid argument: ${JSON.stringify(upperLimit)}`)
  }
  const result = await db.sequelize.query(`
      UPDATE waiting_list 
      SET access_granted = true, access_granted_at = now()
      FROM (
        SELECT business_email
        FROM waiting_list
        WHERE access_granted_at IS NULL
          AND access_granted = false
        ORDER BY access_granted_at ASC LIMIT :limit
      ) c 
      WHERE waiting_list.business_email = c.business_email
      RETURNING
        waiting_list.business_email,
        waiting_list.created_at,
        waiting_list.access_granted,
        waiting_list.access_granted_at`,
  {
    replacements: { limit: upperLimit },
    type: QueryTypes.UPDATE
  })
  return result[0].map(customer => ({
    businessEmail: customer.business_email,
    createdAt: customer.created_at,
    accessGranted: customer.access_granted,
    accessGrantedAt: customer.access_granted_at
  }))
}

module.exports = {
  findAllByBusinessEmail,
  registerInterest,
  updateAccessGranted
}
