const createCheck = require('./createCheck')
const checkForVersionBump = require('./checkForVersionBump')
const updateCheck = require('./updateCheck')

module.exports = app => {
  app.on('pull_request', async context => {
    context.startedAt = new Date()
    const { data: createdCheck } = await createCheck(context)

    const correctionSummary = await checkForVersionBump(context)

    await updateCheck(context, createdCheck.id, correctionSummary)
  })
}
