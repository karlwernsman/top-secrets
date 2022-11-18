const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService.js');

const fakeUser = {
  firstName: 'Lottie',
  lastName: 'Dog',
  email: 'lottie@lottie.com',
  password: 'lottie',
};
const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? fakeUser.password;
  const agent = request.agent(app);
  const user = await UserService.create({ ...fakeUser, ...userProps });

  const { email } = user;

  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('top-secret routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('/POST creates user', async () => {
    const res = await request(app).post('/api/v1/users').send(fakeUser);
    const { firstName, lastName, email } = fakeUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });
  it('/POST logs in the current user', async () => {
    const [agent, user] = await registerAndLogin();
    const me = await agent.get('/api/v1/users/me');

    expect(me.body).toEqual({
      ...user,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });
  it('/DELETE should return a 401 error when signed out and trying to view /users', async () => {
    const res = await request(app).get('/api/v1/users');

    expect(res.body).toEqual({
      message: 'You must be signed in...',
      status: 401,
    });
  });
  it('/GET api/v1/secrets should return the list of secrets if authenticated', async () => {
    const [agent] = await registerAndLogin();
    const res = await agent.get('/api/v1/secrets');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toEqual({
      id: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      createdAt: expect.any(String),
    });
  });
  it('GET api/v1/secrets should return a 401 if not authenticated', async () => {
    const res = await request(app).get('/api/v1/secrets');
    expect(res.status).toEqual(401);
  });

  afterAll(() => {
    pool.end();
  });
});
