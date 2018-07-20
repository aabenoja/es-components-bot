const checkName = 'es-components-bot:version-check'

const paths = {
  lerna: 'lerna.json',
  components: 'packages/es-components/package.json',
  theme: 'packages/es-components-via-theme/package.json',
  wtwTheme: 'packages/es-components-wtw-theme/package.json'
}

const expectedFilenames = [
  paths.lerna,
  paths.components,
  paths.theme,
  paths.wtwTheme
]

module.exports = {
  checkName,
  paths,
  expectedFilenames
}
