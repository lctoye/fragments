const request = require('supertest');
const app = require('../../src/app');
const { postFragment } = require('../utils');

describe('DELETE /v1/fragments/:id', () => {
  test('Cannot delete without being authenticated', () =>
    request(app).get('/v1/fragments').expect(401));

  test('Nonexistent fragment gives a 404 status code', async () => {
    const deleteRes = await request(app)
      .delete(`/v1/fragments/invalid-fragment-id`)
      .auth('user1@email.com', 'password1');

    expect(deleteRes.status).toBe(404);
  });

  test('Successful deletion of a fragment returns 200 OK', async () => {
    const postRes = await postFragment('deleteMe', 'text/markdown');
    const fragment = postRes.body.fragment;

    const deleteRes = await request(app)
      .delete(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.status).toBe('ok');
  });
});
