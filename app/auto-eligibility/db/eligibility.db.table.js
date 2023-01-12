const { Op } = require('sequelize')
const db = require('../../data')

const findByBusinessEmail = async (businessEmail) => {
  console.log(`Finding by business_email: ${JSON.stringify({ businessEmail })}`)
  return await db.eligibility.findOne({
    where: {
      business_email: businessEmail
    }
  })
}

const findAllBySbiOrBusinessEmail = async (sbi, businessEmail) => {
  console.log(`Finding all by sbi or business_email: ${JSON.stringify({ sbi, businessEmail })}`)
  const result = await db.eligibility.findAll({
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
  return await db.eligibility.findAll({
    where: {
      [Op.and]: [
        { business_email: businessEmail },
        { access_granted: accessGranted }
      ]
    }
  })
}

module.exports = {
  findByBusinessEmail,
  findAllBySbiOrBusinessEmail,
  findAllByBusinessEmailAndAccessGranted
}
