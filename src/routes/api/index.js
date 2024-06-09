const express = require('express');
const logger = require('../../logger');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { createFragment } = require('./post');
const getFragments = require('./get'); // Assuming you have a get.js file for handling GET requests

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define the GET /v1/fragments route
router.get('/fragments', getFragments);

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      const { type } = contentType.parse(req);
      logger.debug(`Parsing request with Content-Type: ${type}`);
      return Fragment.isSupportedType(type);
    },
  });

// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
// You can use Buffer.isBuffer(req.body) to test if it was parsed by the raw body parser.
router.post(
  '/fragments',
  rawBody(),
  (req, res, next) => {
    logger.debug('Received POST /fragments request', {
      headers: req.headers,
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body),
    });
    next();
  },
  createFragment
);

module.exports = router;

// /**
//  * The main entry-point for the v1 version of the fragments API.
//  */
// const express = require('express');
// const logger = require('../../logger');
// const contentType = require('content-type');
// const { Fragment } = require('../../model/fragment');
// const { createFragment } = require('./post');

// // Create a router on which to mount our API endpoints
// const router = express.Router();

// // Define our first route, which will be: GET /v1/fragments
// router.get('/fragments', require('./get'));

// // Support sending various Content-Types on the body up to 5M in size
// const rawBody = () =>
//   express.raw({
//     inflate: true,
//     limit: '5mb',
//     type: (req) => {
//       // See if we can parse this content type. If we can, `req.body` will be
//       // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
//       // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
//       const { type } = contentType.parse(req);
//       logger.debug(`Parsing request with Content-Type: ${type}`);
//       return Fragment.isSupportedType(type);
//     },
//   });

// // Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
// // You can use Buffer.isBuffer(req.body) to test if it was parsed by the raw body parser.
// //router.post('/fragments', rawBody(), createFragment);
// router.post(
//   '/fragments',
//   rawBody(),
//   (req, res, next) => {
//     logger.debug('Received POST /fragments request', {
//       headers: req.headers,
//       bodyType: typeof req.body,
//       isBuffer: Buffer.isBuffer(req.body),
//     });
//     next();
//   },
//   createFragment
// );

// // Other routes (DELETE, etc.) will go here later on...

// module.exports = router;
