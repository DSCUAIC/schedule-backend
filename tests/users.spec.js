const HttpStatus = require('http-status-codes')
const supertest = require('supertest')
const mongoose = require('mongoose')

const app = require('../server');

let token;
let response;
let user = {
  email: 'alex.marcu2112@gmail.com',
  password: 'parola12',
  username: 'alex.marcu'
}

describe('User Routes Get Users', () => {

  beforeAll(async () => {
    server = supertest.agent(await app())
    try {
      response = await server.post('/auth/login').send({
        email: user.email,
        password: user.password
      });
      token = 'Bearer ' + response.body.token;
    } catch (err) {
      console.log(err);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect()
  })

  test('get all users should return ok', async () => {
    try {
      response = await server.get('/users')
        .set({ Authorization: token })
        .send();

    } catch (err) {
      console.log(err);
    }
    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.OK);
  });
});

describe('User Routes Change Password', () => {

  async function sendChangePasswordRequest(oldPass, newPass) {
    try {
      response = await server.patch(`/users/change_password`)
        .set({ Authorization: token })
        .send({
          oldPass: oldPass,
          newPass: newPass
        });
      return response;
    } catch (err) {
      console.log(err);
    }
  }

  beforeAll(async () => {
    server = supertest.agent(await app())
    try {
      response = await server.post('/auth/login').send({
        email: user.email,
        password: user.password
      });
      token = 'Bearer ' + response.body.token;
    } catch (err) {
      console.log(err);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect()
  })

  test('change password for an existing user using correct password should return ok', async () => {
    let response = await sendChangePasswordRequest(user.password, 'parola123')

    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.OK);
    response = await sendChangePasswordRequest('parola123', user.password);
  });

  test('change password for an existing user with wrong current pass should fail', async () => {
    let response = await sendChangePasswordRequest('parola1', 'parola1234')

    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  test('change password for an existing user with empty current pass should fail', async () => {
    let response = await sendChangePasswordRequest('', 'parola1234')

    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
  });

  test('change password for an existing user with empty new pass should fail', async () => {
    let response = await sendChangePasswordRequest('parola12', '')

    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
  });

  test('change password for an existing user without current pass should fail', async () => {
    let response;
    try {
      response = await server.patch(`/users/change_password`)
        .set({ Authorization: token })
        .send({
          oldPass: user.password
        });
    } catch (err) {
      console.log(err);
    }

    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
  });

  test('change password for an existing user without new pass should fail', async () => {
    let response;
    try {
      response = await server.patch(`/users/change_password`)
        .set({ Authorization: token })
        .send({
          newPass: 'parola123'
        });
    } catch (err) {
      console.log(err);
    }

    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
  });
})