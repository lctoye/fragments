const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
var contentType = require('content-type');
const { ApplicationError } = require('../../model/app-error');

// UPDATE an existing fragment
module.exports = async (req, res) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;
  const { type } = contentType.parse(req.get('Content-Type'));
  const size = Number(req.headers['content-length']);

  logger.debug({ ownerId, fragmentId, type, size }, 'Updating fragment');

  try {
    const originalFragment = await Fragment.byId(ownerId, fragmentId);
    const isMatchingType = originalFragment.mimeType === type;

    // Type must be same as original
    if (!isMatchingType) {
      logger.error('New type does not match existing type:', type);
      throw new ApplicationError(400, `New type does not match existing type: ${type}`);
    }

    await originalFragment.setData(req.body);

    logger.info(`Updated fragment for ownerId ${ownerId} with fragment ID ${originalFragment.id}`);

    res.status(200).json(createSuccessResponse({ fragment: originalFragment }));
  } catch (err) {
    logger.error('Error updating fragment ', err.message);
    res.status(err.status || 404).json(createErrorResponse(err.status || 404, err.message));
  }
};
