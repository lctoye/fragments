const request = require('supertest');
const app = require('../src/app.js');

/**
 * @typedef {import('../../src/types.js').PostResponse} PostResponse
 */

/**
 * Sends a POST request to create a fragment.
 * @param {Buffer|string} data The data to send in the request.
 * @param {string} contentType The MIME type of the data.
 * @param {string} email The email for authentication.
 * @param {string} password The password for authentication.
 * @returns {Promise<PostResponse>} The response from the server.
 */
async function postFragment(data, contentType, email = 'user1@email.com', password = 'password1') {
  const length = typeof data === 'string' ? data.length : Buffer.byteLength(data);
  return await request(app)
    .post('/v1/fragments')
    .auth(email, password)
    .send(data)
    .set('Content-Type', contentType)
    .set('Content-Length', length.toString());
}

module.exports = {
  postFragment,
};
