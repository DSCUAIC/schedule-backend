const httpStatus = require('http-status-codes')
const supertest = require('supertest')
const mongoose = require('mongoose')
const db = require('../models')
const utils = require('../utils')
const Cryptr = require('cryptr')

const app = require('../server')

describe("GET /schedule", () => {
    let server, token

    beforeAll(async () => {
      server = supertest.agent(await app())


      let key = await db.Secret.findOne({
        env: process.env.NODE_ENV || 'dev', 
        key: 'JWT_KEY'
      })

      key = new Cryptr(process.env.SECRET_KEY).decrypt(key.value)

      token = utils.createTkn({_id: 777}, key);
    })

    afterAll( async () => {
        await mongoose.disconnect()
    })
    describe("For FII", () => {
        let faculty
        beforeAll(async () => {
            faculty = await db.Faculty.findOne({
                shortName: 'FII'
            })

        })

        describe("GET /schedule/rooms", () => {
            test("Should return the entire schedule", async () => {
                let schedule = await utils.getSchedule('./data/schedule.json')
                const response = await server.get('/schedule/rooms')
                .set('Authorization', `Bearer ${token}`)
                
                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
                expect(response.body.schedule).toEqual(schedule)
            })

            test("Should return the schedule for room C901", async () =>{
                const response = await server.get('/schedule/rooms?r=C901')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
                for (const sem in response.body.schedule){
                    for(const year in response.body.schedule[sem]){
                        for(const day in response.body.schedule[sem][year]){
                            for(const course in response.body.schedule[sem][year][day]){
                                expect(response.body.schedule[sem][year][day][course]).toHaveProperty('Sala')
                                expect(response.body.schedule[sem][year][day][course]['Sala']).toEqual('C901')
                            }
                        }
                    }
                }
            })

            test("Should return the schedule for rooms C2, C309 and C412", async () => {
                const response = await server.get('/schedule/rooms?r=C2,C309,C412')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
                for (const sem in response.body.schedule){
                    for(const year in response.body.schedule[sem]){
                        for(const day in response.body.schedule[sem][year]){
                            for(const course in response.body.schedule[sem][year][day]){
                                expect(response.body.schedule[sem][year][day][course]).toHaveProperty('Sala')
                                expect(['C2', 'C309', 'C412']).toContain(response.body.schedule[sem][year][day][course]['Sala'])
                            }
                        }
                    }
                }
            })

            test.skip('Should return null', async () => {
                const response = await server.get('/schedule/rooms?r=something%20that%20shouldnt%20be%20valid')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
                expect(response.body.schedule).toBe(null)
            })
        })

        describe('GET /schedule/year/:yearNumber', () => {
            test.each([1, 2, 3])('GET for year %i', async (year) => {
                const response = await server.get('/schedule/year/' + year)
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
                // deep check
                for(const sem in response.body.schedule){
                    for(const day in response.body.schedule[sem]){
                        for(const course in response.body.schedule[sem][day]){
                            expect(response.body.schedule[sem][day][course]).toHaveProperty('Grupa')
                            expect(response.body.schedule[sem][day][course]['Grupa']).toContain('I' + year)
                        }
                    }
                }
            })

            test('Give wrong year number', async () => {
                const response = await server.get('/schedule/year/023235')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.NOT_FOUND)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(false)
                expect(response.body).toHaveProperty('message')
                expect(response.body.message).toEqual('Invalid year number')
            })

            test('Give no year number', async () => {
                const response = await server.get('/schedule/year/')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.NOT_FOUND)
                expect(response.body).toHaveProperty('message')
                expect(response.body.message).toEqual('Route /schedule/year/ Not found.')
            })
        })
    })
})

