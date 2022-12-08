const processRegisterYourInterestMessage = async (message) => {
  try {
    console.log(`Reading message from queue with body ${JSON.stringify(message.body)}`)
    // todo https://dev.azure.com/defragovuk/DEFRA-FFC/_workitems/edit/135602
  } catch (err) {
    console.error('Unable to process register your interest request message:', err)
  }
}

module.exports = processRegisterYourInterestMessage
