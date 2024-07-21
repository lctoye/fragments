const app = require('../../src/app');
const request = require('supertest');

describe('Authentication Tests', () => {

  test('convert markdown fragment to HTML', async () => {
    // First, create a markdown fragment
    const createRes = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/markdown')
      .auth('user1@email.com', 'password1')
      .send('# Hello World\nThis is a markdown fragment.');

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.status).toBe('ok');

    const fragmentId = createRes.body.fragment.id;

    // Then, retrieve the fragment as HTML
    const getRes = await request(app)
      .get(`/v1/fragments/${encodeURIComponent(fragmentId)}.html`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/html');
    expect(getRes.text).toContain('<h1>Hello World</h1>');
    expect(getRes.text).toContain('<p>This is a markdown fragment.</p>');
  });
});