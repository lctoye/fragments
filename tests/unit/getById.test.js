const request = require('supertest');
const app = require('../../src/app');
const contentType = require('content-type');
const { postFragment } = require('../utils');

// image handling
const fs = require('fs');
const path = require('path');

const username = 'user1@email.com';
const password = 'password1';

describe('GET /v1/fragments/:id', () => {
  test('user can create fragment then get by id', async () => {
    const data = Buffer.from('Hello');
    const postRes = await postFragment(data, 'text/plain');

    const result = postRes.body.fragment;

    const getRes = await request(app)
      .get('/v1/fragments/' + result.id)
      .auth('user1@email.com', 'password1');

    expect(getRes.text).toBe('Hello');
  });

  test('Correct status code and content type returned', async () => {
    const data = Buffer.from('Hello');

    const postRes = await postFragment(data, 'text/plain');

    const result = postRes.body.fragment;

    const getRes = await request(app)
      .get('/v1/fragments/' + result.id)
      .auth('user1@email.com', 'password1');

    expect(getRes.status).toBe(200);
    // content type is text/plain
    const { type } = contentType.parse(getRes);
    expect(type).toBe('text/plain');
  });

  test('unknown fragment returns HTTP 404', async () => {
    await postFragment('Hello', 'text/plain');

    const getExpandedRes = await request(app)
      .get(`/v1/fragments/BAD-ID`)
      .auth('user1@email.com', 'password1');

    expect(getExpandedRes.status).toBe(404);
  });

  test('create fragment of markdown type', async () => {
    const data = '## hello';

    const postRes = await postFragment(data, 'text/markdown');

    const fragment = postRes.body.fragment;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(getRes.status).toBe(200);
  });

  test('valid markdown to html conversion', async () => {
    const data = '## hello';

    const postRes = await postFragment(data, 'text/markdown');

    const fragment = postRes.body.fragment;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragment.id}.html`)
      .auth('user1@email.com', 'password1');

    expect(getRes.text).toBe('<h2>hello</h2>\n');
    expect(getRes.status).toBe(200);
  });

  test('invalid markdown to jpeg conversion results in 415', async () => {
    const data = '## hello';

    const postRes = await postFragment(data, 'text/markdown');

    const fragment = postRes.body.fragment;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragment.id}.jpg`)
      .auth('user1@email.com', 'password1');

    expect(getRes.status).toBe(415);
  });

  // ----- more conversions ------------------------------------------

  // text/markdown -> text/html
  test('text/plain to text/plain conversion', async () => {
    const data = '## Hello';
    const postRes = await postFragment(data, 'text/markdown');
    const fragment = postRes.body.fragment;
    const getRes = await request(app)
      .get(`/v1/fragments/${fragment.id}.txt`)
      .auth(username, password);

    expect(getRes.text).toBe('Hello');
    expect(getRes.status).toBe(200);
  });

  // text/html -> text/plain
  test('text/html to text/plain conversion', async () => {
    const data = '<p>Hello</p><p>Goodbye</p>';
    const postRes = await postFragment(data, 'text/html');
    const fragment = postRes.body.fragment;
    const getRes = await request(app)
      .get(`/v1/fragments/${fragment.id}.txt`)
      .auth(username, password);

    expect(getRes.text).toBe('Hello\n\nGoodbye');
    expect(getRes.status).toBe(200);
  });

  // text/csv -> text/plain
  test('text/csv to text/plain conversion', async () => {
    const data = 'a,b,c\n1,2,3';
    const postRes = await postFragment(data, 'text/csv');
    const fragment = postRes.body.fragment;
    const getRes = await request(app)
      .get(`/v1/fragments/${fragment.id}.txt`)
      .auth(username, password);

    expect(getRes.text).toBe('a,b,c\n1,2,3');
    expect(getRes.status).toBe(200);
  });

  // text/csv -> application/json
  test('text/csv to application/json conversion', async () => {
    const data = 'a,b,c\n1,2,3\n4,5,6';
    const postRes = await postFragment(data, 'text/csv');
    const fragment = postRes.body.fragment;
    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.json`)
      .auth(username, password)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    expect(res.body).toEqual([
      { a: '1', b: '2', c: '3' },
      { a: '4', b: '5', c: '6' },
    ]);
  });

  // application/json -> text/plain
  test('application/json to text/plain conversion', async () => {
    const data = '{"a": 1, "b": 2}';
    const postRes = await postFragment(data, 'application/json');
    const fragment = postRes.body.fragment;
    const getRes = await request(app)
      .get(`/v1/fragments/${fragment.id}.txt`)
      .auth(username, password);

    expect(getRes.text).toBe('"{\\"a\\": 1, \\"b\\": 2}"');
    expect(getRes.status).toBe(200);
  });

  // image/png -> image/png
  test('image/png to image/png conversion', async () => {
    // Path to the PNG file to upload
    const filePath = path.join(__dirname, 'test.png');

    // Upload the PNG file
    const postRes = await postFragment(Buffer.from(fs.readFileSync(filePath)), 'image/png');
    const fragmentId = postRes.body.fragment.id;

    expect(postRes.status).toBe(201);

    // Retrieve the PNG file
    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.gif`) // Adjust the endpoint as necessary
      .auth(username, password)
      .expect('Content-Type', 'image/gif'); // Ensure the Content-Type is correct

    expect(getRes.status).toBe(200);
  });
});
