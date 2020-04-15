const HttpStatus = require('http-status-codes')
const supertest = require('supertest')
const mongoose = require('mongoose')

const app = require('../server')

const db = require('../models')


const existingUser = {firstname: "Test", lastname: "Test" , email:"test@test.com", password: "1234567"}
const nonExistingUser = {firstname: "Test", lastname: "Test", email: "hello@test.com", password: "1234567"}
const tooShortPass = {firstname: "Test", lastname: "Test" , email: "hello@test.com", password: "1234"}
const invalidEmail = {firstname: "Test", lastname: "Test" , email: "hellotest.com", password: "1234"}

describe ('POST /auth/register', () => {
    let server

    beforeAll(async () => {
        server = supertest.agent(await app())
    })

    afterAll(async () => {
        await db.User.deleteOne({
            email: nonExistingUser.email
        })
        await mongoose.disconnect()
    })
    test('it should pass if the user is registered', async() => {
        try{
            const response = await server.post('/auth/register').send(nonExistingUser)
            expect(response.status).toEqual(HttpStatus.OK)
            expect(response.body).toHaveProperty('success')
            expect(response.body.success).toEqual(true)
            expect(response.body).toHaveProperty('token')
            expect(response.body.token).toEqual(expect.anything())
        }
        catch(error){
            expect(error).toBeNull()
        }
    })
    test('send an user that already exists', async() => {
        try{
            const response = await server.post('/auth/register').send(existingUser)
            expect(response.status).toEqual(HttpStatus.CONFLICT)
            expect(response.body).toHaveProperty('success')
            expect(response.body.success).toEqual(false)
            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toEqual("User already exists!")
        }
        catch(error){
            expect(error).toBeNull()
        }
    })
    test('send a password too short', async() => {
        try{
            const response = await server.post('/auth/register').send(tooShortPass)
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
    test('send an invalid email', async() => {
        try{
            const response = await server.post('/auth/register').send(invalidEmail)
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
    test('firstname is missing', async() => {
        try{
            const response = await server.post('/auth/register').send({
                email: "hello@test.com"
            })
            expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
            expect(response.body).toHaveProperty('success')
            expect(response.body.success).toEqual(false)
            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toEqual("\"firstname\" is required")
        }
        catch(error)
        {
            expect(error).toBeNull()
        }
    })
    test('lastname is missing', async() => {
        try{
            const response = await server.post('/auth/register').send({
                firstname: "Test",
                email: "hello@test.com"
            })
            expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
            expect(response.body).toHaveProperty('success')
            expect(response.body.success).toEqual(false)
            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toEqual("\"lastname\" is required")
        }
        catch(error)
        {
            expect(error).toBeNull()
        }
    })
    test('email is missing', async() => {
        try{
            const response = await server.post('/auth/register').send({
                firstname: "Test",
                lastname: "Test"
            })
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
    test('password is missing', async() => {
        try{
            const response = await server.post('/auth/register').send({
                firstname: "Test",
                lastname: "Test",
                email: "hello@test.com"
            })
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
    test('firstname field is empty', async() => {
        try{
            const response = await server.post('/auth/register').send({
                firstname: "",
                lastname: "",
                email: "",
                password: ""
            })
            expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
            expect(response.body).toHaveProperty('success')
            expect(response.body.success).toEqual(false)
            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toEqual("\"firstname\" is not allowed to be empty")
        }
        catch(error)
        {
            expect(error).toBeNull()
        }
    })
    test('lastname field is empty', async() => {
        try{
            const response = await server.post('/auth/register').send({
                firstname: "Test",
                lastname: "",
                email: "",
                password: ""
            })
            expect(response.status).toEqual(HttpStatus.BAD_REQUEST)
            expect(response.body).toHaveProperty('success')
            expect(response.body.success).toEqual(false)
            expect(response.body).toHaveProperty('message')
            expect(response.body.message).toEqual("\"lastname\" is not allowed to be empty")
        }
        catch(error)
        {
            expect(error).toBeNull()
        }
    })
    test('email field is empty', async() => {
        try{
            const response = await server.post('/auth/register').send({
                firstname: "Test",
                lastname: "Test",
                email: "",
                password: ""
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
    test('password field is empty', async() => {
        try{
            const response = await server.post('/auth/register').send({
                firstname: "Test",
                lastname: "Test",
                email: "hello@test.com",
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
})