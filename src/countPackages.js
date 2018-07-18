const request = require('request-promise-native')

async function countInRepo (target) {
  const branch = target.ref
  const template = target.repo.contents_url
  const contentsUrl = `${template.replace('{+path}', 'packages')}?ref=${branch}`

  const requestOptions = {
    json: true,
    headers: {
      'User-Agent': 'es-components-bot'
    }
  }
  const contents = await request(contentsUrl, requestOptions)

  return contents.length
}

async function countPackages (context) {
  const { head, base } = context.payload.pull_request
  const headCount = await countInRepo(head)
  const bodyCount = await countInRepo(base)

  return bodyCount > headCount ? bodyCount : headCount
}

module.exports = countPackages
