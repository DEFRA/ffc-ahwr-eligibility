describe('Process waiting list function test.', () => {
  test('test function executed', async () => {
    const spyConsole = jest.spyOn(console, 'log')
    const { processWaitingList } = require('../../../../../app/auto-eligibility/lib/process-waiting-list')
    await processWaitingList(50)
    expect(spyConsole).toHaveBeenCalledWith('Executing process waiting list with limit of 50.')
  })
})
