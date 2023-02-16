const MOCK_NOW = new Date()

describe('event schema', () => {
  const EVENT_SCHEMA = require('../../../app/event/event.schema')

  test.each([
    {
      toString: () => 'a valid event',
      given: {
        event: {
          name: 'mock_name',
          properties: {
            id: 'mock_id',
            sbi: 'mock_sbi',
            cph: 'n/a',
            checkpoint: 'mock_checkpoint',
            status: 'mock_status',
            action: {
              type: 'mock_type.',
              message: 'mock_message',
              data: {
              },
              raisedOn: MOCK_NOW,
              raisedBy: 'mock_raisedBy'
            }
          }
        }
      },
      expect: {
        result: {
          value: {
            name: 'mock_name',
            properties: {
              id: 'mock_id',
              sbi: 'mock_sbi',
              cph: 'n/a',
              checkpoint: 'mock_checkpoint',
              status: 'mock_status',
              action: {
                type: 'mock_type.',
                message: 'mock_message',
                data: {
                },
                raisedOn: MOCK_NOW,
                raisedBy: 'mock_raisedBy'
              }
            }
          }
        }
      }
    },
    {
      toString: () => 'an invalid event - cph missing',
      given: {
        event: {
          name: 'mock_name',
          properties: {
            id: 'mock_id',
            sbi: 'mock_sbi',
            checkpoint: 'mock_checkpoint',
            status: 'mock_status',
            action: {
              type: 'mock_type.',
              message: 'mock_message',
              data: {
              },
              raisedOn: MOCK_NOW,
              raisedBy: 'mock_raisedBy'
            }
          }
        }
      },
      expect: {
        result: {
          value: {
            name: 'mock_name',
            properties: {
              id: 'mock_id',
              sbi: 'mock_sbi',
              checkpoint: 'mock_checkpoint',
              status: 'mock_status',
              action: {
                type: 'mock_type.',
                message: 'mock_message',
                data: {
                },
                raisedOn: MOCK_NOW,
                raisedBy: 'mock_raisedBy'
              }
            }
          },
          error: {
            message: '"properties.cph" is required'
          }
        }
      }
    }
  ])('%s', async (testCase) => {
    const result = EVENT_SCHEMA.validate(testCase.given.event)
    expect(result.value).toEqual(testCase.expect.result.value)
    if (typeof result.error === 'undefined') {
      expect(result.error).toBeUndefined()
    } else {
      expect(result.error.message).toEqual(testCase.expect.result.error.message)
    }
  })
})
