const request = require('request-promise-native')
const uniq = require('lodash/uniq')

const checkName = 'es-components-bot:version-check'
const expectedFilenames = [
  'lerna.json',
  'packages/es-components/package.json',
  'packages/es-components-via-theme/package.json'
]

function createCheck (context) {
  const params = context.repo({
    name: checkName,
    head_branch: context.payload.pull_request.head.ref,
    head_sha: context.payload.pull_request.head.sha
  })
  return context.github.checks.create(params)
}

function getVersions (files) {
  const requests = files.map(({ raw_url }) =>
    request(raw_url, {json: true}).then(({ version }) => version)
  )

  return Promise.all(requests)
}

async function checkForVersionBump (context) {
  const { data } = await context.github.pullRequests.getFiles(context.issue())
  const files = data.filter(file => expectedFilenames.includes(file.filename))

  if (files.length !== 3) { return 'A version bump is required. Please run `npm run version_only` at the project root' }

  const versions = await getVersions(files)
  console.log(`versions are: ${JSON.stringify(versions)}`)

  if (uniq(versions).length !== 1) { return 'Package versions have not been bumped correctly. You may have manually updated a package. Please run `npm run version_only` at the root of the project' }
}

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

module.exports = app => {
  app.on('pull_request', async context => {
    const { data: createdCheck } = await createCheck(context)

    const correctionSummary = await checkForVersionBump(context)

    await updateCheck(context, createdCheck.id, correctionSummary)
  })
}
