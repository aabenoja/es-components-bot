const { checkName } = require('./constants')

function updateCheck (context, runId, correctionSummary) {
  const conclusion = !correctionSummary ? 'success' : 'failure'

  let summary = 'All versions have been bumped correctly.'
  if (correctionSummary) summary = correctionSummary

  const params = context.repo({
    name: checkName,
    check_run_id: runId,
    status: 'completed',
    conclusion,
    completed_at: new Date().toISOString(),
    output: {
      title: 'es-components version check',
      summary
    }
  })
  return context.github.checks.update(params)
}

module.exports = updateCheck
