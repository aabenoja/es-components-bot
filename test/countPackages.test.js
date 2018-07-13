jest.mock('request-promise-native')

const countPackages = require('../src/countPackages')
const mockedRequest = require('request-promise-native')
const expectedResponse = [ 1, 2 ]
let mockedBaseResponse

mockedRequest.mockImplementation(url => {
  if (url === 'https://api.github.com/repos/WTW-IM/es-components/contents/packages?ref=master') {
    return mockedBaseResponse
  }
  return expectedResponse
})

const testContext = {
  payload: {
    pull_request: {
      head: {
        ref: 'sr-only',
        repo: {
          contents_url: 'https://api.github.com/repos/aabenoja/es-components/contents/{+path}'
        }
      },
      base: {
        ref: 'master',
        repo: {
          contents_url: 'https://api.github.com/repos/WTW-IM/es-components/contents/{+path}'
        }
      }
    }
  }
}

beforeEach(() => { mockedBaseResponse = expectedResponse })

test('uses count from head by default', async () => {
  const count = await countPackages(testContext)
  expect(count).toBe(2)
})

test('uses body count if body result is larger than head', async () => {
  mockedBaseResponse = [ 1, 2, 3 ]
  const count = await countPackages(testContext)
  expect(count).toBe(3)
})
