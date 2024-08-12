const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

// Get a fragment by id
module.exports = async (req, res) => {
  const fragmentId = req.params.id;
  const ownerId = req.user;

  logger.debug({ ownerId, fragmentId }, 'Fetching fragment info by ID');

  try {
    const fragment = await Fragment.byId(ownerId, fragmentId);

    logger.info(`Fetched fragment for ownerId ${ownerId} and fragment ID ${fragmentId}`);
    logger.debug({ fragment }, 'Fragment');

    res.status(200).send(
      createSuccessResponse({
        fragment,
      })
    );
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error));
    logger.error(`Failed to fetch fragment for ownerId ${ownerId} and fragment ID ${fragmentId}`);
  }
};
