// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const logger = require('../logger');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({
    id,
    ownerId,
    created = new Date().toISOString(),
    updated = new Date().toISOString(),
    type,
    size = 0,
  }) {
    if (!ownerId || !type) {
      throw new Error('ownerId and type are required');
    }
    if (typeof size !== 'number' || size < 0) {
      throw new Error('size must be a non-negative number');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error('Unsupported type');
    }

    // TODO
    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;

    logger.debug(`Created new fragment: ${JSON.stringify(this)}`);
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    try {
      const fragments = await listFragments(ownerId, expand);
      return fragments;
    } catch (error) {
      throw new Error(`Error finding fragments byUser for ownerId ${ownerId}: ${error.message}`);
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    try {
      let fragmentMetadata = await readFragment(ownerId, id);

      // If no fragment is found, throw an error
      if (!fragmentMetadata) {
        throw new Error(`Fragment not found for ownerId: ${ownerId} and id: ${id}`);
      }

      return new Fragment(fragmentMetadata);
    } catch {
      // Rethrow with error message
      throw new Error(`Error fetching fragment byId for ownerId=${ownerId} and id=${id}`);
    }
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    // TODO
    try {
      return deleteFragment(ownerId, id);
    } catch (error) {
      throw new Error(
        `Error deleting fragment for ownerId=${ownerId} and id=${id}: ${error.message}`
      );
    }
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    try {
      this.updated = new Date().toISOString();
      return writeFragment(this);
    } catch (error) {
      throw new Error(
        `Error saving fragment for ownerId=${this.ownerId} and id=${this.id}: ${error.message}`
      );
    }
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    // TODO

    try {
      const fragmentData = readFragmentData(this.ownerId, this.id);

      if (!fragmentData) {
        throw new Error(`Fragment not found for ownerId: ${this.ownerId} and id: ${this.id}`);
      }

      return fragmentData; // promise
    } catch (err) {
      throw new Error(
        `Error fetching fragment data for ownerId=${this.ownerId} and id=${this.id}: ${err.message}`
      );
    }
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    try {
      if (!Buffer.isBuffer(data)) {
        throw new Error('Data must be a buffer');
      }

      this.size = data.length;
      this.updated = new Date().toISOString();

      await writeFragmentData(this.ownerId, this.id, data);

      return;
    } catch (error) {
      throw new Error(
        `Error setting fragment data for ownerId=${this.ownerId} and id=${this.id}: ${error.message}`
      );
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    // TODO
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    const conversionMap = {
      'text/plain': ['text/plain'],
      'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
      'text/html': ['text/html', 'text/plain'],
      'text/csv': ['text/csv', 'text/plain', 'application/json'],
      'application/json': ['application/json', 'text/plain'],
      'image/png': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/jpeg': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/webp': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/avif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/gif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
    };

    // Extract the media type
    let { type } = contentType.parse(this.mimeType);

    return conversionMap[type];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const validTypes = [
      `text/plain`,
      `text/markdown`,
      `text/html`,
      `text/csv`,
      `application/json`,

      `image/png`,
      `image/jpeg`,
      `image/webp`,
      `image/avif`,
      `image/gif`,
    ];

    // Extract the media type
    let { type } = contentType.parse(value);

    // Check if the value includes any of the valid types
    return validTypes.includes(type);
  }
}

// export the Fragment class
module.exports.Fragment = Fragment;
