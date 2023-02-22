
const telemetryEvent = require('../../../../app/auto-eligibility/telemetry/telemetry-event')

const MOCK_SEND_EVENT = jest.fn()

describe('Raise Telemetry Event', () => {
  let raiseTelemetryEvent

  beforeAll(() => {
    jest.mock('../../../../app/app-insights/app-insights.config', () => ({
      appInsightsCloudRole: 'mock_app_insights_cloud_role'
    }))
    jest.mock('ffc-ahwr-event-publisher', () => {
      return {
        PublishEvent: jest.fn().mockImplementation(() => {
          return {
            sendEvent: MOCK_SEND_EVENT
          }
        })
      }
    })

    raiseTelemetryEvent = require('../../../../app/auto-eligibility/telemetry/raise-telemetry-event')
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  afterAll(() => {
    jest.resetModules()
  })

  test.each([
    {
      toString: () => 'raiseTelemetryEvent',
      given: {
        customer: {
          sbi: 'mock_sbi',
          crn: 'mock_crn',
          businessEmail: 'business@email.com'
        }
      },
      when: {
        telemetryEvent: telemetryEvent.GAINED_ACCESS_TO_THE_APPLY_JOURNEY,
        message: 'message',
        data: {
          crn: 'mock_crn',
          sbi: 'mock_sbi',
          businessEmail: 'test@email.com'
        }
      },
      expect: {
        action: {
          type: `auto-eligibility:${telemetryEvent.GAINED_ACCESS_TO_THE_APPLY_JOURNEY}`,
          message: 'message',
          data: {
            crn: 'mock_crn',
            sbi: 'mock_sbi',
            businessEmail: 'test@email.com'
          },
          raisedBy: 'business@email.com'
        }
      }
    }
  ])('%s', async (testCase) => {
    await raiseTelemetryEvent(testCase.given.customer)(
      testCase.when.telemetryEvent,
      testCase.when.message,
      testCase.when.data
    )
    expect(MOCK_SEND_EVENT).toHaveBeenCalledTimes(1)
    expect(MOCK_SEND_EVENT).toHaveBeenCalledWith({
      name: 'send-session-event',
      properties: {
        id: 'mock_sbi_mock_crn',
        sbi: 'mock_sbi',
        cph: 'n/a',
        checkpoint: 'mock_app_insights_cloud_role',
        status: 'success',
        action: testCase.expect.action
      }
    })
  })
})
