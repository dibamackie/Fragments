// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

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
    constructor({ id = randomUUID(), ownerId, type, size = 0, created = new Date().toISOString(), updated = new Date().toISOString() }) {
      if (!ownerId || !type) {
        throw new Error('ownerId and type are required');
      }
  
      if (typeof size !== 'number' || size < 0) {
        throw new Error('size must be a non-negative number');
      }
  
      // Validate type
      if (!Fragment.isSupportedType(type)) {
        throw new Error(`Invalid type: ${type}`);
      }
  
      this.id = id;
      this.ownerId = ownerId;
      this.type = type;
      this.size = size;
      this.created = created;
      this.updated = updated;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);
    console.log("Fragments fetched from memory:", fragments);
    if (!expand) {
      console.log("Returning fragment IDs:", fragments);
      return fragments;  // No need to map, it's already an array of IDs
    }
    console.log('not map');
    return fragments; 
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragmentData = await readFragment(ownerId, id);
    if (!fragmentData) {
      throw new Error('Fragment not found');
    }

    const fragment = new Fragment(fragmentData);
    return fragment;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static async delete(ownerId, id) {
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      throw new Error(`Fragment ${id} not found for owner ${ownerId}`);
    }
    console.log(`Moving forward to deleteFragment`);
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  save() {
    return new Promise((resolve, reject) => {
      this.updated = new Date().toISOString();
      try {
        writeFragment(this); // Assuming writeFragment is synchronous
        resolve(); // Indicate success
      } catch (error) {
        reject(error); // Propagate any error
      }
    });
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }

    this.size = data.length;
    await writeFragmentData(this.ownerId, this.id, data);
    this.updated = new Date().toISOString();
    await this.save();
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
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    if (this.isText) {
      return ['text/plain'];
    }
    return [];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    // Allow 'text/*', 'application/json', and any content type with 'charset=utf-8'
    const supportedTypes = [
      'text/plain',
      'text/markdown',
      'text/html',
      'application/json',
      'application/yaml',
      'text/csv',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'image/avif'
    ];
    
    // Extract the base type and check if it includes 'charset=utf-8'
    const [baseType] = value.split(';').map(part => part.trim());
  
    // Check if it's a supported type or if it contains 'charset=utf-8'
    return supportedTypes.includes(baseType) || value.includes('charset=utf-8') || baseType.startsWith('text/');
  }
}

module.exports.Fragment = Fragment;
