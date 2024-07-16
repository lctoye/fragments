const request = require('supertest');
const app = require('../../src/app');
const { postFragment } = require('../utils');

describe('GET /v1/fragments/:id/info', () => {
  test('user can create fragment, get it, and have the same id', async () => {
    const data = Buffer.from('hello');

    const postReq = await postFragment(data, 'text/plain');

    const fragment = postReq.body.fragment;

    const getRes = await request(app)
      .get('/v1/fragments/' + fragment.id + '/info')
      .auth('user1@email.com', 'password1');

    const getResult = getRes.body.fragment;

    expect(getResult.id).toBe(fragment.id);
    expect(getRes.status).toBe(200);
  });

  test('info has proper keys', async () => {
    const postRes = await postFragment('hello', 'text/plain');

    const fragment = postRes.body.fragment;

    const getExpandedRes = await request(app)
      .get(`/v1/fragments/${fragment.id}/info`)
      .auth('user1@email.com', 'password1');

    const getFragment = getExpandedRes.body.fragment;

    expect('fragment' in getExpandedRes.body).toBe(true);

    // Ensure the expanded fragment has the correct keys
    expect('ownerId' in getFragment).toBe(true);
    expect('created' in getFragment).toBe(true);
    expect('updated' in getFragment).toBe(true);
    expect('size' in getFragment).toBe(true);
    expect('type' in getFragment).toBe(true);
    expect('id' in getFragment).toBe(true);
  });

  test('unknown fragment returns HTTP 404', async () => {
    await postFragment('hello', 'text/plain');

    // const postFragment = postRes.body.fragment;

    const getExpandedRes = await request(app)
      .get(`/v1/fragments/BAD-ID/info`)
      .auth('user1@email.com', 'password1');

    expect(getExpandedRes.status).toBe(404);
  });
});
