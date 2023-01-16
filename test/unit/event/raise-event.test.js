const raiseEvent = require('../../../app/event/raise-event')
const mockSendEvent = jest.fn()

jest.mock('ffc-ahwr-event-publisher', () => {
  return {
    PublishEvent: jest.fn().mockImplementation(() => {
      return { sendEvent: mockSendEvent }
    })
  }
})

describe('Raise event test', () => {
  const event = {
    id: '123456789',
    sbi: '123456789',
    cph: '123/456/789',
    status: 'in progress',
    ip: '1.1.1.1',
    name: 'test',
    action: {
      type: 'event',
      message: 'test',
      data: {}
    }
  }

  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('Send event', async () => {
    await raiseEvent(event, 'test')
    expect(mockSendEvent).toHaveBeenCalledTimes(1)
  })
})
