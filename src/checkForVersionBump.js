const uniq = require('lodash/uniq')
const getVersions = require('./getVersions')
const { expectedFilenames } = require('./constants')

async function checkForVersionBump (context) {
  const { data } = await context.github.pullRequests.getFiles(context.issue())
  const files = data.filter(file => expectedFilenames.includes(file.filename))

  if (files.length !== 3) { return 'A version bump is required. Please run `npm run version_only` at the project root' }

  const versions = await getVersions(files)
  console.log(`versions are: ${JSON.stringify(versions)}`)

  if (uniq(versions).length !== 1) { return 'Package versions have not been bumped correctly. You may have manually updated a package. Please run `npm run version_only` at the root of the project' }
}

module.exports = checkForVersionBump
