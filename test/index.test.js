jest.mock('request-promise-native')

const { createRobot } = require('probot')
const app = require('../src')
const synchronized = require('./fixtures/synchronized')
const { paths } = require('../src/constants')

const mockedRequest = require('request-promise-native')

let robot, github, files, lernaVersion
const expectedVersion = '13.1.1'

mockedRequest.mockImplementation(url => {
  if (url === 'https://api.github.com/repos/aabenoja/es-components/contents/packages?ref=sr-only') {
    return [ 1, 2 ]
  }

  let version = expectedVersion
  if (url === paths.lerna) { version = lernaVersion }
  return Promise.resolve({ version })
})

beforeEach(() => {
  files = []
  lernaVersion = '13.1.0'
  robot = createRobot()
  app(robot)
  github = {
    checks: {
      create: jest.fn().mockReturnValue(Promise.resolve({data: {}})),
      update: jest.fn().mockReturnValue(Promise.resolve({}))
    },
    pullRequests: {
      getFiles: jest.fn().mockImplementation(() => Promise.resolve({ data: files }))
    }
  }
  robot.auth = () => Promise.resolve(github)
})

test('creates a github check against the ', async () => {
  await robot.receive(synchronized)
  expect(github.checks.create).toHaveBeenCalled()
})

test('pulls updated files', async () => {
  await robot.receive(synchronized)
  expect(github.pullRequests.getFiles).toHaveBeenCalled()
})

test('updates the github check with the updated status', async () => {
  await robot.receive(synchronized)
  expect(github.checks.update).toHaveBeenCalled()
})

describe('check status', () => {
  const correctedPaths = [{
    filename: paths.lerna,
    raw_url: paths.lerna
  }, {
    filename: paths.components,
    raw_url: paths.components
  }, {
    filename: paths.theme,
    raw_url: paths.theme
  }]

  test('fails when not all files are updates', async () => {
    await robot.receive(synchronized)
    const updateArgs = github.checks.update.mock.calls[0][0]
    expect(updateArgs.conclusion).toBe('failure')
  })

  test('fails when some or all json files are not bumped', async () => {
    files = correctedPaths

    await robot.receive(synchronized)
    const updateArgs = github.checks.update.mock.calls[0][0]
    expect(updateArgs.conclusion).toBe('failure')
  })

  test('succeeds when some or all json files are not bumped', async () => {
    files = correctedPaths
    lernaVersion = expectedVersion

    await robot.receive(synchronized)
    const updateArgs = github.checks.update.mock.calls[0][0]
    expect(updateArgs.conclusion).toBe('success')
  })
})
