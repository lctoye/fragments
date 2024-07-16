const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const MarkdownIt = require('markdown-it');

module.exports = async (req, res) => {
  const paramId = req.params.id;
  const ownerId = req.user;
  const [fragmentId, ext] = paramId.split('.');

  logger.debug({ paramId, ownerId, fragmentId, ext }, 'Fetching fragment by ID');

  try {
    const fragment = await Fragment.byId(ownerId, fragmentId);
    const fragmentData = await fragment.getData();

    logger.info(`Fetched fragment for ownerId ${ownerId} and fragment ID ${fragmentId}`);


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
    return res.status(404).json(createErrorResponse(404, 'fragment not found'));
  }
};

const extToType = {
  avif: 'image/avif',
  csv: 'text/csv',
  gif: 'image/gif',
  html: 'text/html',
  jpg: 'image/jpeg',
  json: 'application/json',
  md: 'text/markdown',
  png: 'image/png',
  txt: 'text/plain',
  webp: 'image/webp',
};

const converters = {
  'text/markdown': {
    'text/html': (data) => {
      const md = new MarkdownIt({ html: true });
      return md.render(data.toString());
    }
  }
};

async function convertFragment(fragmentData, fragment, ext) {
  const extType = extToType[ext]; // ext -> mime/type
  //const validTypes = fragment.; // array of fragment's valid types
  const fragmentType = fragment.type;

  // Check if the requested type is valid
  if (fragmentType !== 'text/markdown') {
    throw new Error(`Cannot convert fragment to ${extType}`);
  }

  const fragmentConverters = converters[fragmentType];
  if (fragmentConverters && fragmentConverters[extType]) {
    return fragmentConverters[extType](fragmentData);
  }

  return fragmentData; // Return original data if no conversion is needed
}

// // src/routes/api/getById.js
// const { Fragment } = require("../../model/fragment");
// const logger = require("../../logger");
// const { createErrorResponse } = require("../../response");
// const mime = require("mime-types");
// const markdown = require("markdown-it")();
 
// module.exports = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const ownerId = req.user;
 
//     let fragment = await Fragment.byId(ownerId, id);
 
//     if (!fragment) {
//       return res
//         .status(404)
//         .json(createErrorResponse(404, "Fragment not found"));
//     }
 
//     let data = await fragment.getData();
//     let mimeType = fragment.type;
 
//     // Check if there's an extension in the id
//     const idParts = id.split(".");
//     if (idParts.length > 1) {
//       const requestedExtension = idParts.pop();
//       const requestedMimeType = mime.lookup(requestedExtension);
 
//       if (!requestedMimeType) {
//         return res
//           .status(415)
//           .json(createErrorResponse(415, "Unsupported Media Type"));
//       }
 
//       // Handle conversion
//       if (
//         fragment.type === "text/markdown" &&
//         requestedMimeType === "text/html"
//       ) {
//         data = markdown.render(data.toString());
//         mimeType = "text/html";
//       } else if (fragment.type !== requestedMimeType) {
//         return res
//           .status(415)
//           .json(createErrorResponse(415, "Unsupported conversion"));
//       }
//     }
 
//     res.setHeader("Content-Type", mimeType);
//     res.status(200).send(data);
//   } catch (error) {
//     logger.error(error);
//     res.status(500).json(createErrorResponse(500, error.message));
//   }
// };