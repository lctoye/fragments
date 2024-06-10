const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Get a fragment by ID
 */
module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const fragmentId = req.params.id;
    const fragment = await Fragment.byId(ownerId, fragmentId);

    logger.info(`Found fragment ${fragment.id} for user ${fragment.ownerId}`);
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (error) {
    if (error.message.includes('not found for user')) {
      logger.warn(`Fragment not found for ID ${req.params.id}`);
      return res.status(404).json(createErrorResponse(404, 'fragment not found'));
    }

    logger.error('Error getting fragment by ID', error.message);
    res.status(500).json(createErrorResponse(500, error.message));
  }
};
