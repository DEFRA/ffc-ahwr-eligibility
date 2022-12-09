const processRegisterYourInterestMessage = require('../../../../../app/register-your-interest/messaging/process-message')

describe(('Consume register your interest message tests'), () => {
  test('successfully fetched register your interest message', async () => {
    const message = { body: { foo: 'bar' } }
    const logSpy = jest.spyOn(console, 'log')
    await processRegisterYourInterestMessage(message)
    expect(logSpy).toHaveBeenCalledWith('Reading message from queue with body {"foo":"bar"}')
  })
})
