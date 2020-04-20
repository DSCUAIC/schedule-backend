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
            test.each([1, 2, 3])('Should return the schedule for year %i', async (year) => {
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

        describe('GET /schedule/year/:yearNumber/semester/:semesterNumber', () => {
            test.each([ [1, 1], [1, 2],
                        [2, 1], [2, 2],
                        [3, 1], [3, 2]])('Should return the schedule for year %d, semester %d', async (year, semester) => {
                const response = await server.get('/schedule/year/' + year + '/semester/' + semester)
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')

                // can't really check whether the semester is right, hence there's no clear pattern in the response data. I'll check the year, though.
                for(const day in response.body.schedule){
                    for(const course in response.body.schedule[day]){
                        expect(response.body.schedule[day][course]).toHaveProperty('Grupa')
                        expect(response.body.schedule[day][course]['Grupa']).toContain('I' + year)
                    }
                }
            })

            test('Give wrong year number', async () => {
                const response = await server.get('/schedule/year/0/semester/1')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.NOT_FOUND)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(false)
                expect(response.body).toHaveProperty('message')
                expect(response.body.message).toEqual('Invalid year number')
            })

            test('Give wrong semester number', async () => {
                const response = await server.get('/schedule/year/1/semester/0')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.NOT_FOUND)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(false)
                expect(response.body).toHaveProperty('message')
                expect(response.body.message).toEqual('Invalid semester number')
            })
        })

        describe('GET /schedule/year/:yearNumber/semester/:semesterNumber/group/:groupName', () => {
            
            test.skip('Should return schedule for the first semester, for I1E3', async () => {
                let doWeGetCourses = false;
                const response = await server.get('/schedule/year/1/semester/1/group/E3')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
                
                for(const day in response.body.schedule){
                    for(const course in response.body.schedule[day]){
                        if(response.body.schedule[day][course]['Tip'] === 'Curs'){
                            expect(response.body.schedule[day][course]['Grupa']).toContain('I1E')
                            doWeGetCourses = true
                        }
                        
                        else
                            expect(response.body.schedule[day][course]['Grupa']).toContain('I1E3')
                    }
                }

                // finally, check that we do, in fact, also get the courses
                expect(doWeGetCourses).toEqual(true)
            })

            test('Give wrong year number', async () => {
                let doWeGetCourses = false;
                const response = await server.get('/schedule/year/0/semester/1/group/E3')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.NOT_FOUND)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(false)
                expect(response.body).toHaveProperty('message')
                expect(response.body.message).toEqual('Invalid year number')
            })

            test('Give wrong semester number', async () => {
                let doWeGetCourses = false;
                const response = await server.get('/schedule/year/1/semester/0/group/E3')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.NOT_FOUND)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(false)
                expect(response.body).toHaveProperty('message')
                expect(response.body.message).toEqual('Invalid semester number')
            })

            test('Give wrong group name', async () => {
                let doWeGetCourses = false;
                const response = await server.get('/schedule/year/1/semester/1/group/This%20should%20really%20not%20be%20here')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.NOT_FOUND)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(false)
                expect(response.body).toHaveProperty('message')
                expect(response.body.message).toEqual('Invalid group name')
            })
        })

        describe('GET /schedule/', () => {
            test('provide no parameters', async () => {
                const response = await server.get('/schedule')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
                expect(response.body.schedule).toHaveProperty('FII')
                expect(response.body.schedule.FII).toHaveProperty('sem1')
                expect(response.body.schedule.FII).toHaveProperty('sem2')
            })

            test.skip('provide wrong faculty', async () => {
                const response = await server.get('/schedule?faculty=FI')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
                expect(response.body.schedule).toBe(null)
            })

            test('provide only faculty', async () => {
                const response = await server.get('/schedule?faculty=FII')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
                expect(response.body.schedule).toHaveProperty('sem1')
                expect(response.body.schedule).toHaveProperty('sem2')
            })

            test('provide wrong semester', async () => {
                const response = await server.get('/schedule?faculty=FII&semester=0')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.NOT_FOUND)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(false)
                expect(response.body).toHaveProperty('message')
                expect(response.body.message).toEqual('Invalid semester number')
            })

            test.skip('provide semester', async () => {
                const response = await server.get('/schedule?faculty=FII&semester=1')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
            })

            test('provide wrong year', async () => {
                const response = await server.get('/schedule?faculty=FII&year=0')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
                //expect(response.body.schedule).toEqual()
            })

            test('provide year', async () => {
                const response = await server.get('/schedule?faculty=FII&year=1')
                .set('Authorization', `Bearer ${token}`)

                expect(response.status).toEqual(httpStatus.OK)
                expect(response.body).toHaveProperty('success')
                expect(response.body.success).toEqual(true)
                expect(response.body).toHaveProperty('schedule')
                expect(response.body.schedule).toHaveProperty('sem1')
                expect(response.body.schedule).toHaveProperty('sem2')
                
                // deep check

                for(const sem in response.body.schedule)
                    for(const day in response.body.schedule[sem])
                        for(const course in response.body.schedule[sem][day])
                            expect(response.body.schedule[sem][day][course]['Grupa']).toContain('I1')
            })


        })
        
    })
})

