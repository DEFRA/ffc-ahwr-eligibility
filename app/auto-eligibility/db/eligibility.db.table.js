const db = require('../../data')

const findByBusinessEmail = async (businessEmail) => {
  console.log(`Finding by business_email: ${JSON.stringify({ businessEmail })}`)
  return await db.eligibility.findOne({
    where: {
      business_email: businessEmail
    }
  })
}

const findAllByBusinessEmail = async (businessEmail) => {
  console.log(`Finding all by business_email: ${JSON.stringify({ businessEmail })}`)
  return await db.eligibility.findAll({
    where: {
      business_email: businessEmail
    }
  })
}

module.exports = {
  findByBusinessEmail,
  findAllByBusinessEmail
}
