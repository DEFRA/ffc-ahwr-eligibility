const unhandledRejection = async (err) => {
  console.error(err)
  process.exit(1)
}

module.exports = unhandledRejection
