const HttpStatus = require('http-status-codes')
const supertest = require('supertest')
const mongoose = require('mongoose')

const app = require('../server')

describe('GET /', () => {
  let server

  beforeAll(async () => {
    server = supertest.agent(await app())
  })

  afterAll(async () => {
    await mongoose.disconnect()
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
