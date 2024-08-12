const { createSuccessResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
var contentType = require('content-type');
const { ApplicationError } = require('../../model/app-error');

// Create a new fragment for the current user
module.exports = async (req, res, next) => {
  const ownerId = req.user;
  const { type } = contentType.parse(req.get('Content-Type'));
  const size = Number(req.headers['content-length']);

  logger.debug({ ownerId, type, size }, 'Creating a new fragment');

  try {
    const isSupportedType = Fragment.isSupportedType(type);

    // 415 - Disallow unsupported types
    if (!isSupportedType) {
      logger.error('Unsupported type:', type);
      throw new ApplicationError(415, `Unsupported type: ${type}`);
    }

    const fragment = new Fragment({
      ownerId,
      type,
      size,
    });

    await fragment.save();
    await fragment.setData(req.body);

    logger.info(`Created new fragment for ownerId ${ownerId} with fragment ID ${fragment.id}`);

    const hostUrl = `${req.secure ? `https://` : `http://`}${req.headers.host}`;
    logger.debug({ hostUrl }, 'Host URL');

    res.setHeader('Location', `${hostUrl}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'Error creating a new fragment');
    next(err);
  }
};
