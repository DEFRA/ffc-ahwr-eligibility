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

const findAllByBusinessEmail = async (businessEmail) => {
  console.log(`Finding all business_email : ${JSON.stringify({ businessEmail })}`)
  return db.eligibility.findAll({
    where: {
      business_email: businessEmail
    }
  })
}

module.exports = {
  findByBusinessEmail,
  findAllByBusinessEmailAndAccessGranted,
  findAllByBusinessEmail
}
