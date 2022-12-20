const processIneligible = async (sbi, crn, businessEmail) => {
  console.log(`Processing as ineligible: ${JSON.stringify({ sbi, crn, businessEmail })}`)
  await Promise.resolve()
}

module.exports = processIneligible
