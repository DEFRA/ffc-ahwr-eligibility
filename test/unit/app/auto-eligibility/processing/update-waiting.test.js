const db = require('../../../../../app/data')
const updateWaiting = require('../../../../../app/auto-eligibility/processing/update-waiting')

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

  test('waiting_updated_at should be non when record is NON_WAITING_ELIGIBILITY', async () => {
    await db.eligibility.create(NON_WAITING_ELIGIBILITY)
    const result = await db.eligibility.findOne({ where: { sbi: SBI, crn: CRN } })
    expect(result.waiting_updated_at).toBeNull()
  })

  test('waiting_updated_at should not be non when NON_WAITING_ELIGIBILITY record has been promoted with updateWaiting', async () => {
    await db.eligibility.create(NON_WAITING_ELIGIBILITY)
    await updateWaiting(SBI, CRN)
    const result = await db.eligibility.findOne({ where: { sbi: SBI, crn: CRN } })
    expect(result.waiting_updated_at).not.toBeNull()
  })
})
