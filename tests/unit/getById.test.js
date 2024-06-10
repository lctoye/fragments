const app = require('../../src/app');
const request = require('supertest');

describe('Authentication Tests', () => {
  test('missing auth is denied', () => request(app).get('/v1/fragments/testid').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments/testid').auth('incorrect', 'credentials').expect(401));

  test('authenticated users receive fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('a fragment');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');

    const resGet = request(app)
      .get(`/v1/fragments/${res.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    expect((await resGet).statusCode).toBe(200);
    expect((await resGet).body.status).toBe('ok');
  });

  test('authenticated users receive 404 for missing fragment', async () => {
    const resGet = request(app).get('/v1/fragments/missing').auth('user1@email.com', 'password1');
    expect((await resGet).statusCode).toBe(404);
  });
});
