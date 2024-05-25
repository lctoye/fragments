// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // Put the data into a success response object
  const successResponse = createSuccessResponse({
    status: 'ok',
    fragments: [],
  });

  // Send a 200 'OK' response with the success response as JSON
  res.status(200).json(successResponse);

  // TODO: this is just a placeholder. To get something working, return an empty array...
  // res.status(200).json({
  //   status: 'ok',
  //   // TODO: change me
  //   fragments: [],
  // });
};
