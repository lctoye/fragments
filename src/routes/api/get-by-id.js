const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const MarkdownIt = require('markdown-it');
const { ApplicationError } = require('../../model/app-error');
const { htmlToText } = require('html-to-text');
const { markdownToTxt } = require('markdown-to-txt');
const sharp = require('sharp');
const csvtojson = require('csvtojson');

// Get a fragment by id
module.exports = async (req, res, next) => {
  const paramId = req.params.id;
  const ownerId = req.user;
  const [fragmentId, ext] = paramId.split('.');

  logger.debug({ paramId, ownerId, fragmentId, ext }, 'Fetching fragment by ID');

  try {
    const fragment = await Fragment.byId(ownerId, fragmentId);
    const fragmentData = await fragment.getData();

    logger.info(`Fetched fragment for ownerId ${ownerId} and fragment ID ${fragmentId}`);
    // logger.debug({ fragmentData, fragment }, 'Fragment info'); // This can cause some trouble if the fragment is an image

    // Extension provided, convert if possible
    if (ext !== undefined) {
      const convertedData = await convertFragment(fragmentData, fragment, ext);

      logger.debug(`Converted ${fragment.mimeType} to ${extToType[ext]}`);

      res.setHeader('Content-Type', extToType[ext]);
      res.status(200).send(convertedData);
      return;
    }

    res.setHeader('Content-Type', fragment.type);
    res.status(200).send(fragmentData);
  } catch (err) {
    logger.error(`Failed to fetch fragment for ownerId ${ownerId} and fragment ID ${fragmentId}`);
    logger.debug({ err }, 'Error fetching fragment');
    next(
      new ApplicationError(
        err.status || 404,
        `Failed to fetch fragment for ownerId ${ownerId} and fragment ID ${fragmentId}`
      )
    );
  }
};

const extToType = {
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  csv: 'text/csv',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

async function convertFragment(fragmentData, fragment, ext) {
  const extType = extToType[ext]; // ext -> mime/type
  const validTypes = fragment.formats; // array of fragment's valid types
  const fragmentType = fragment.mimeType;

  // Check if the requested type is valid
  if (!validTypes.includes(extType)) {
    throw new ApplicationError(415, `Cannot convert fragment to ${extType}`);
  }

  let convertedData = fragmentData;

  // Convert the fragment to the requested type
  switch (fragmentType) {
    // TEXT/MARKDOWN
    case 'text/markdown':
      if (extType === 'text/html') {
        const md = new MarkdownIt({ html: true });
        convertedData = md.render(fragmentData.toString());
      } else if (extType === 'text/plain') {
        convertedData = markdownToTxt(convertedData.toString());
      }
      break;

    //  TEXT/HTML
    case 'text/html':
      if (extType === 'text/plain') {
        convertedData = htmlToText(fragmentData.toString());
      }
      break;

    //  TEXT/CSV
    case 'text/csv':
      if (extType === 'text/plain') {
        convertedData = fragmentData.toString();
      } else if (extType === 'application/json') {
        await csvtojson()
          .fromString(fragmentData.toString())
          .then((jsonObj) => {
            convertedData = jsonObj;
          });
      }
      break;

    //  APPLICATION/JSON
    case 'application/json':
      if (extType === 'text/plain') {
        convertedData = JSON.stringify(fragmentData.toString());
      }
      break;
  }

  // IMAGE/*
  // Convert any image to the requested type
  if (fragmentType.startsWith('image/')) {
    logger.debug(`Converting image from ${fragmentType} to ${extType}`);
    convertedData = await sharp(fragmentData).toFormat(ext).toBuffer();
  }

  return convertedData;
}
