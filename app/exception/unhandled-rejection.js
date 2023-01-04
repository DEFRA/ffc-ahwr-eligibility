const logger = require('../logger')

const unhandledRejection = async (err) => {
  logger.logError(err, 'Unhandled rejection')
  process.exit(1)
}

module.exports = unhandledRejection
