
const { MessageReceiver } = require('ffc-messaging')
const service = require('../../../app/messaging/service')

jest.mock('ffc-messaging')

const mocksubscribe = jest.fn()
const mockClose = jest.fn()
MessageReceiver.prototype.subscribe = mocksubscribe
MessageReceiver.prototype.closeConnection = mockClose

describe(('Consume register your interest message tests'), () => {
  test('successfully fetched register your interest message', async () => {
    await service.start()
    expect(mocksubscribe).toHaveBeenCalledTimes(1)
  })

  test('successfully closed session', async () => {
    await service.stop()
    expect(mockClose).toHaveBeenCalledTimes(1)
  })
})
