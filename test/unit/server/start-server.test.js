describe('Start Server', () => {
  const MOCK_NOW = new Date()
  const MOCK_WAITING_LIST_SCHEDULER = {}
  const MOCK_URI = 'MOCK_URI'
  const MOCK_SERVER = {
    start: jest.fn(() => {}),
    register: jest.fn(() => {}),
    info: {
      uri: MOCK_URI
    }
  }
  let server
  let logSpy

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    jest.mock('../../../app/auto-eligibility/waiting-list/waiting-list-scheduler', () => MOCK_WAITING_LIST_SCHEDULER)
    jest.mock('../../../app/server/server', () => MOCK_SERVER)

    server = require('../../../app/server/server')

    logSpy = jest.spyOn(console, 'log')
  })

  afterAll(() => {
    jest.resetModules()
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  test('start server', async () => {
    const startServer = require('../../../app/server/start-server')

    await startServer()

    expect(server.start).toHaveBeenCalledTimes(1)
    expect(server.register).toHaveBeenCalledWith(MOCK_WAITING_LIST_SCHEDULER)
    expect(logSpy).toHaveBeenCalledWith(`${MOCK_NOW.toISOString()} Server running on %s`, MOCK_URI)
  })
})
