const createMessage = (body, type, options) => {
  return {
    body,
    type,
    source: 'ffc-ahwr-eligibility',
    ...options
  }
}

module.exports = createMessage
