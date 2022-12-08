const processRegisterYourInterestMessage = async (message, receiver) => {
  try {
    console.log(`Reading message from queue with body ${message.body}`)
    // todo https://dev.azure.com/defragovuk/DEFRA-FFC/_workitems/edit/135602
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process register your interest request:', err)
  }
}

module.exports = processRegisterYourInterestMessage
