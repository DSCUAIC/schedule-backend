const HttpStatus = require('http-status-codes')
const supertest = require('supertest')
const mongoose = require('mongoose')

const app = require('../server')

const existingUser = {email:"test@test.com", password: "1234567"}
const existingUserNotVal = {email: "testnotval@test.com", password: "1234567"}
const nonExistingUser = {email: "test2@test.com", password: "1234567"}
const userWrongPass = {email: "test@test.com", password: "123456"}


describe('POST /auth/login', () => {

    let server

    beforeAll(async () => {
        server = supertest.agent(await app())
    })

    afterAll(async () => {
        await mongoose.disconnect()
    })

    test('send existing user validated', async() => {
      try{
        const response = await server.post('/auth/login').send(existingUser)
        expect(response.status).toEqual(HttpStatus.OK)
        expect(response.body).toHaveProperty('success')
        expect(response.body.success).toEqual(true)
        expect(response.body.token).toEqual(expect.anything())
      }
      catch(error)
      {
        expect(error).toBeNull()
      }
    })
    test('send existing user not validated', async() => {
        try{
            const response = await server.post('/auth/login').send(existingUserNotVal)
            expect(response.status).toEqual(HttpStatus.UNAUTHORIZED)
            expect(response.body).toHaveProperty('success')
            expect(response.body.success).toEqual(false)
            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toEqual("User not validated!")
        }
        catch(error)
        {
            expect(error).toBeNull()
        }
    })
    test('send user with wrong password', async() => {
        try{
            const response = await server.post('/auth/login').send(userWrongPass)
            expect(response.status).toEqual(HttpStatus.UNAUTHORIZED)
            expect(response.body).toHaveProperty('success')
            expect(response.body.success).toEqual(false)
            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toEqual("Incorrect password!")
        }
        catch(error)
        {
            expect(error).toBeNull()
        }
    })
    test('send password too short', async() => {
      try{
        const response = await server.post('/auth/login').send({
          email:"test@test.com", 
          password: "1234"
          })
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
        expect(response.body).toHaveProperty('success')
        expect(response.body.success).toEqual(false)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toEqual("\"password\" length must be at least 6 characters long")
      }
      catch(error)
      {
          expect(error).toBeNull()
      }
    })
    test('send empty password', async() => {
      try{
        const response = await server.post('/auth/login').send({
          email:"hello@test.com", 
          password: ""
          })
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
        expect(response.body).toHaveProperty('success')
        expect(response.body.success).toEqual(false)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toEqual("\"password\" is not allowed to be empty")
      }
      catch(error)
      {
          expect(error).toBeNull()
      }
    })
    test('send non valid email address' , async() => {
      try{
        const response = await server.post('/auth/login').send({
          email:"hellotest.com", 
          password: "1234"
          })
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
        expect(response.body).toHaveProperty('success')
        expect(response.body.success).toEqual(false)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toEqual("\"email\" must be a valid email")
      }
      catch(error)
      {
          expect(error).toBeNull()
      }
    })
    test('send empty email address' , async() => {
      try{
        const response = await server.post('/auth/login').send({
          email:"", 
          password: "1234"
          })
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
        expect(response.body).toHaveProperty('success')
        expect(response.body.success).toEqual(false)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toEqual("\"email\" is not allowed to be empty")
      }
      catch(error)
      {
          expect(error).toBeNull()
      }
    })
    test('send nonexisting user', async() => {
      try{
        const response = await server.post('/auth/login').send(nonExistingUser)
        expect(response.status).toEqual(HttpStatus.NOT_FOUND)
        expect(response.body).toHaveProperty('success')
        expect(response.body.success).toEqual(false)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toEqual("User not found!")
      }
      catch(error)
      {
        expect(error).toBeNull()
      }
    })
    test('email field is missing', async() => {
      try{
        const response = await server.post('/auth/login').send({})
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
        expect(response.body).toHaveProperty('success')
        expect(response.body.success).toEqual(false)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toEqual("\"email\" is required")
      }
      catch(error)
      {
        expect(error).toBeNull()
      }
    })
    test('password field is missing', async() => {
      try{
        const response = await server.post('/auth/login').send({email: "hello@test.com"})
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
        expect(response.body).toHaveProperty('success')
        expect(response.body.success).toEqual(false)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toEqual("\"password\" is required")
      }
      catch(error)
      {
        expect(error).toBeNull()
      }
    })
  })