const db = require('../../../../../app/data')
const checkEligibility = require('../../../../../app/auto-eligibility/processing/check-eligibility')

const NON_WAITING_ELIGIBILITY = JSON.parse(JSON.stringify(require('../../../../mock-components/mock-eligibility').nonWaitingEligibility))
const SBI = require('../../../../mock-components/mock-sbi')
const CRN = require('../../../../mock-components/mock-crn')

describe('process check Eligibility', () => {
  beforeAll(async () => {
    await db.sequelize.truncate({
      cascade: true,
      restartIdentity: true
    })
  })

  beforeEach(async () => {
    await db.sequelize.truncate({
      cascade: true,
      restartIdentity: true
    })
  })

  afterEach(async () => {
    await db.sequelize.truncate({
      cascade: true,
      restartIdentity: true
    })
  })

  afterAll(async () => {
    await db.sequelize.close()
  })

  test('should return null when no record in database', async () => {
    const result = await checkEligibility(23, 28)
    expect(result).toBeNull()
  })

  test('should return null when sbi and crn not in database', async () => {
    await db.eligibility.create(NON_WAITING_ELIGIBILITY)
    const result = await checkEligibility(23, 28)
    expect(result).toBeNull()
  })

  test('should return true when sbi and crn in database', async () => {
    await db.eligibility.create(NON_WAITING_ELIGIBILITY)
    const result = await checkEligibility(SBI, CRN)
    expect(result).not.toBeNull()
  })
})
