describe('Index test', () => {

  let messageService
  let server 

  beforeEach(async () => {
    messageService = require('../../app/messaging/service')
    server = require('../../app/server')
    jest.mock('../../app/server')
    jest.mock('../../app/messaging/service')
  })

  test('Entry point starts server and message bus', () => {
    const entryPoint = require('../../app/index')
    expect(server.start()).toBeCalledTimes(1)
    expect(messageService.start()).toBeCalledTimes(1)
    expect(entryPoint).toBeDefined()
  })
})
