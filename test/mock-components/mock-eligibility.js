const SBI = require('./mock-sbi')
const CRN = require('./mock-crn')
const CUSTOMER_NAME = require('./mock-customer-name')
const BUSINESS_NAME = require('./mock-business-name')
const BUSINESS_EMAIL = require('./mock-business-email')
const BUSINESS_ADDRESS = require('./mock-business-address')
const LAST_UPDATED_AT = require('./mock-dates').LAST_UPDATED_AT
const WAITING_UPDATED_AT = require('./mock-dates').WAITING_UPDATED_AT

const nonWaitingEligibility = {
  sbi: SBI,
  crn: CRN,
  customer_name: CUSTOMER_NAME,
  business_name: BUSINESS_NAME,
  business_email: BUSINESS_EMAIL,
  business_address: BUSINESS_ADDRESS,
  last_updated_at: LAST_UPDATED_AT.DATE
}

const waitingEligibility = {
  sbi: SBI,
  crn: CRN,
  customer_name: CUSTOMER_NAME,
  business_name: BUSINESS_NAME,
  business_email: BUSINESS_EMAIL,
  business_address: BUSINESS_ADDRESS,
  last_updated_at: LAST_UPDATED_AT.DATE,
  waiting_updated_at: WAITING_UPDATED_AT.DATE
}

module.exports = {
  nonWaitingEligibility,
  waitingEligibility
}
