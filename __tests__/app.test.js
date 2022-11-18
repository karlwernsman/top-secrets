const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

const fakeUser = {
  firstName: 'Lottie',
  lastName: 'Dog',
  email: 'lottie@lottie.com',
  password: 'lottie',
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

  afterAll(() => {
    pool.end();
  });
});
