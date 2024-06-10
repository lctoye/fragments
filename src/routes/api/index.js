// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const logger = require('../../logger');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { createFragment } = require('./post');
const getFragments = require('./get');
const getById = require('./getById');

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

// Define the GET /v1/fragments/:id route
router.get('/fragments/:id', getById);

module.exports = router;
