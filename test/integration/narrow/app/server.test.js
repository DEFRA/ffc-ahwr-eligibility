describe('Server test', () => {
  test('createServer returns server', () => {
    const server = require('../../../../app/server/server')
    expect(server).toBeDefined()
  })
})
