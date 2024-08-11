const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
var contentType = require('content-type');

module.exports = async (req, res) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;
  const { type } = contentType.parse(req.get('Content-Type'));
  const size = Number(req.headers['content-length']);

  logger.debug({ ownerId, fragmentId, type, size }, 'Updating fragment...');

  try {
    const toUpdate = await Fragment.byId(ownerId, fragmentId);
    const sameType = toUpdate.mimeType === type;

    if (!sameType) {
      logger.error('Cannot update fragment due to type mismatch. Original type was:', type);
      createErrorResponse(400, `Cannot update fragment due to type mismatch. Original type was: ${type}`);
    }

    await toUpdate.setData(req.body);

    logger.info(`Updated fragment for ownerId ${ownerId} with fragment ID ${toUpdate.id}`);

    res.status(200).json(createSuccessResponse({ fragment: toUpdate }));
  } catch (err) {
    logger.error('Error updating fragment ', err.message);
    res.status(err.status || 404).json(createErrorResponse(err.status || 404, err.message));
  }
};
