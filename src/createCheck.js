const { checkName } = require('./constants')

function createCheck (context) {
  const params = context.repo({
    name: checkName,
    started_at: context.toISOString(),
    head_branch: context.payload.pull_request.head.ref,
    head_sha: context.payload.pull_request.head.sha
  })
  return context.github.checks.create(params)
}

module.exports = createCheck
