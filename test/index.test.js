jest.mock('request-promise-native')

const { createRobot } = require('probot')
const app = require('../index')
const synchronized = require('./fixtures/synchronized')

const mockedRequest = require('request-promise-native')

let robot, github, files, lernaVersion

mockedRequest.mockImplementation(url => {
  let version = '13.1.1'
  if (url === 'lerna.json') { version = lernaVersion }
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
  test('fails when not all files are updates', async () => {
    await robot.receive(synchronized)
    const updateArgs = github.checks.update.mock.calls[0][0]
    expect(updateArgs.conclusion).toBe('failure')
  })

  test('fails when some or all json files are not bumped', async () => {
    files = [{
      filename: 'lerna.json',
      raw_url: 'lerna.json'
    }, {
      filename: 'packages/es-components/package.json',
      raw_url: 'packages/es-components/package.json'
    }, {
      filename: 'packages/es-components-via-theme/package.json',
      raw_url: 'packages/es-components-via-theme/package.json'
    }]

    await robot.receive(synchronized)
    const updateArgs = github.checks.update.mock.calls[0][0]
    expect(updateArgs.conclusion).toBe('failure')
  })

  test('succeeds when some or all json files are not bumped', async () => {
    files = [{
      filename: 'lerna.json',
      raw_url: 'lerna.json'
    }, {
      filename: 'packages/es-components/package.json',
      raw_url: 'packages/es-components/package.json'
    }, {
      filename: 'packages/es-components-via-theme/package.json',
      raw_url: 'packages/es-components-via-theme/package.json'
    }]

    lernaVersion = '13.1.1'

    await robot.receive(synchronized)
    const updateArgs = github.checks.update.mock.calls[0][0]
    expect(updateArgs.conclusion).toBe('success')
  })
})
