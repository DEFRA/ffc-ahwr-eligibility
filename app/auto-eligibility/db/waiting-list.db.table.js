const { fn, col, where } = require('sequelize')
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

module.exports = {
  findAllByBusinessEmail,
  registerInterest
}
