describe('Unhandled Rejection Test', () => {
  test('Should handle rejection', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
    const mockConsole = jest.spyOn(console, 'error').mockImplementation(() => {})
    const unhandledRejection = require('../../../../app/exception/unhandledRejection')
    await unhandledRejection()
    expect(mockExit).toHaveBeenCalledTimes(1)
    expect(mockConsole).toHaveBeenCalledTimes(1)
  })
})
