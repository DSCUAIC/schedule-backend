const HttpStatus = require('http-status-codes')
const supertest = require('supertest')

const app = require('../app')

describe('GET /', () => {
  let server

  beforeAll(async () => {
    server = supertest(app)
  })

  test('should succeed if server is up', async () => {
    try {
      const response = await server.get('/')

      expect(response.status).toEqual(HttpStatus.OK)
      expect(response.body).toHaveProperty('status')
      expect(response.body.status).toEqual('active')
    } catch (error) {
      expect(error).toBeNull()
    }
  })
})
