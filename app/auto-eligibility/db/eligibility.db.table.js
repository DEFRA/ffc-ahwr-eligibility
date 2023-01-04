const { Op } = require('sequelize')
const db = require('../../data')
const appInsights = require('../../app-insights')

const findByBusinessEmail = async (businessEmail) => {
  appInsights.logTrace('Finding by business_email', {
    businessEmail
  })
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

module.exports = {
  findByBusinessEmail,
  findAllByBusinessEmailAndAccessGranted
}
