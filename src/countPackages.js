const request = require('request-promise-native')

async function countPackages (context) {
  const { head } = context.payload.pull_request
  const branch = head.ref
  const template = head.repo.contents_url
  const contentsUrl = `${template.replace('{+path}', 'packages')}?ref=${branch}`

  const contents = await request(contentsUrl, {json: true})

  return contents.length
}

module.exports = countPackages
