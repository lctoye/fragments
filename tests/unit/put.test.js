const request = require('supertest');
const app = require('../../src/app');
const { postFragment } = require('../utils');

describe('PUT /v1/fragments/:id', () => {
  test('update existing fragment', async () => {
    const postRes = await postFragment('## hello', 'text/markdown');
    const initialFragment = postRes.body.fragment;

    const getRes = await request(app)
      .get(`/v1/fragments/${initialFragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe('## hello');

    const putRes = await request(app)
      .put(`/v1/fragments/${initialFragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .set('Content-Length', '## goodbye'.length)
      .send('## goodbye');

    expect(putRes.status).toBe(200);
    expect(putRes.body.status).toBe('ok');
    expect(putRes.body.fragment.id).toBe(initialFragment.id);
  });

  test('update existing fragment with different type', async () => {
    const postRes = await postFragment('## hello', 'text/markdown');
    const initialFragment = postRes.body.fragment;

    const getRes = await request(app)
      .get(`/v1/fragments/${initialFragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(getRes.status).toBe(200);
    expect(getRes.text).toBe('## hello');

    const putRes = await request(app)
      .put(`/v1/fragments/${initialFragment.id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .set('Content-Length', '## goodbye'.length)
      .send('## goodbye');

    expect(putRes.status).toBe(400);
    expect(putRes.body.status).toBe('error');
    expect(putRes.body.error.code).toBe(400);
    expect(putRes.body.error.message).toBe('New type does not match existing type: text/plain');
  });

  test('update non-existent fragment', async () => {
    const putRes = await request(app)
      .put(`/v1/fragments/invalid-id`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .set('Content-Length', '## goodbye'.length)
      .send('## goodbye');

    expect(putRes.status).toBe(404);
    expect(putRes.body.status).toBe('error');
    // expect(putRes.body.fragment.id).toBe(initialFragment.id);
  });
});
