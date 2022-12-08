const { MessageReceiver } = require('ffc-messaging')
const processRegisterYourInterestMessage = require('../../../../app/register-your-interest/messaging/process-message')

describe(('Consume register your interest message tests'), () => {
    
  test('successfully fetched register your interest message', async () => {

    let mockCompleteMessage = jest.fn()

    const receiver = {       
        receiver: {
            completeMessage: mockCompleteMessage
        }
    }

    await processRegisterYourInterestMessage({ body: { foo: 'bar'}}, receiver)

    expect(mockCompleteMessage).toHaveBeenCalled
  })
})
