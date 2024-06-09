const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  const fragmentData = 'This is a fragment';

  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(fragmentData)
      .expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .set('Content-Type', 'text/plain')
      .send(fragmentData)
      .expect(401));

  // Using a valid username/password pair should allow creating a plain text fragment
  test('auth`d users can create a fragment with a location header', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(fragmentData);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        ownerId: expect.any(String),
        type: 'text/plain',
        size: fragmentData.length,
        created: expect.any(String),
        updated: expect.any(String),
      })
    );
    expect(res.headers.location).toMatch(new RegExp(`/v1/fragments/${res.body.fragment.id}$`));
  });

  // Trying to create a fragment with an unsupported type should return 415 - unsupported media type
  test('trying to create fragment with unsupported type errors w/ 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/xml')
      .send('<data>This is a fragment</data>');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });
});
