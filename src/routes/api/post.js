const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
var contentType = require('content-type');

const createFragment = async (req, res) => {
  const ownerId = req.user;
  const { type } = contentType.parse(req.get('Content-Type'));
  const size = Number(req.headers['content-length']);

  logger.debug('Received POST /fragments request', {
    headers: req.headers,
    bodyType: typeof req.body,
    isBuffer: Buffer.isBuffer(req.body),
  });

  if (!Buffer.isBuffer(req.body)) {
    logger.warn('Unsupported content-type in request body');
    const errorResponse = createErrorResponse(415, 'invalid request, missing fragment data');
    return res.status(415).json(errorResponse);
  }

  try {
    const fragment = new Fragment({
      ownerId,
      type,
      size,
    });

    logger.debug(`Created fragment ${fragment.id} for user ${fragment.ownerId}`);

    await fragment.save();
    await fragment.setData(req.body);

    const successResponse = createSuccessResponse({ fragment });

    // Construct the Location header URL
    const location = `${req.protocol}://${req.get('host')}/v1/fragments/${fragment.id}`;
    res.setHeader('Location', location);

    return res.status(201).json(successResponse);
  } catch (error) {
    logger.error('Error creating fragment', error);
    const errorResponse = createErrorResponse(500, 'internal server error');
    return res.status(500).json(errorResponse);
  }
};

module.exports = { createFragment };
