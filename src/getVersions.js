const request = require('request-promise-native')

function getVersions (files) {
  const requests = files.map(({ raw_url }) =>
    request(raw_url, {json: true}).then(({ version }) => version)
  )

  return Promise.all(requests)
}

module.exports = getVersions
