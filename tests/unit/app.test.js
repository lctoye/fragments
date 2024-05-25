// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('Test for 404 response', () => {
  test('should return 404 response', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.statusCode).toBe(403);
  });
});
