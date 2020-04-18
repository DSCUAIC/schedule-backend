const HttpStatus = require('http-status-codes')
const supertest = require('supertest')
const mongoose = require('mongoose')

const app = require('../server');

let token;
let response;
let user = {
  email: 'test@test.com',
  password: '1234567',
  username: 'login.test'
}

describe('User Routes Get User', () => {

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

  test('get user should return ok', async () => {
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

  test('get user without token should be unauthorized', async () => {
    try {
      response = await server.get('/users')
        .send();

    } catch (err) {
      console.log(err);
    }
    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  test('get user should return current user`s details', async () => {
    try {
      response = await server.get('/users')
        .set({ Authorization: token })
        .send();

    } catch (err) {
      console.log(err);
    }
    expect(response.body.user.email).toEqual(user.email);
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
    response = await sendChangePasswordRequest(user.password, '12345678')

    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.OK);
    response = await sendChangePasswordRequest('12345678', user.password);
  });

  test('change password for an existing user with wrong current pass should fail', async () => {
    response = await sendChangePasswordRequest('wrongPass', 'newPass')

    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
  });

  test('change password for an existing user with empty current pass should fail', async () => {
    response = await sendChangePasswordRequest('', 'newPass')

    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
  });

  test('change password for an existing user with empty new pass should fail', async () => {
    response = await sendChangePasswordRequest('1234567', '')

    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
  });

  test('change password for an existing user without current pass should fail', async () => {
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
    try {
      response = await server.patch(`/users/change_password`)
        .set({ Authorization: token })
        .send({
          newPass: 'newPass'
        });
    } catch (err) {
      console.log(err);
    }

    expect(response).toHaveProperty('status');
    expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
  });
})