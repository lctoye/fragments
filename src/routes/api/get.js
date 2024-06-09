// src/routes/api/get.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const fragList = await Fragment.byUser(req.user, req.query.expand);
    logger.debug('expand is set to ' + req.query.expand);
    res.status(200).json(createSuccessResponse({ fragments: fragList }));
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
  }
};
