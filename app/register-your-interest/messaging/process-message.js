const processRegisterYourInterestMessage = async (message) => {
  console.log(`Reading message from queue with body ${JSON.stringify(message.body)}`)
  // todo https://dev.azure.com/defragovuk/DEFRA-FFC/_workitems/edit/135602
}

module.exports = processRegisterYourInterestMessage
