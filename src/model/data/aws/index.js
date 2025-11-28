// src\model\data\aws\index.js

const MemoryDB = require('../memory/memory-db');
const s3Client = require('./s3Client');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

// Create two in-memory databases: one for fragment metadata and the other for raw data
const data = new MemoryDB();
console.log('data', data);
const metadata = new MemoryDB();

// Write a fragment's metadata to memory db. Returns a Promise<void>
async function writeFragment(fragment) {
  const serialized = JSON.stringify(fragment);
  console.log(`Saving fragment for owner ${fragment.ownerId}:`, serialized);
  await metadata.put(fragment.ownerId, fragment.id, serialized); // Ensure this actually saves data
}

// Read a fragment's metadata from memory db. Returns a Promise<Object>
async function readFragment(ownerId, id) {
  // NOTE: this data will be raw JSON, we need to turn it back into an Object.
  // You'll need to take care of converting this back into a Fragment instance
  // higher up in the callstack.
  const serialized = await metadata.get(ownerId, id);
  return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
}

// Writes a fragment's data to an S3 Object in a Bucket
// https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#upload-an-existing-object-to-an-amazon-s3-bucket
async function writeFragmentData(ownerId, id, data) {
  console.log('writeFragmentData called with:', { ownerId, id, data });

  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`, // Our key will be a mix of the ownerID and fragment id, written as a path
    Body: data,
  };

  console.log('S3 PUT params:', params);

  // Create a PUT Object command to send to S3
  const command = new PutObjectCommand(params);

  try {
    console.log('Sending PUT command to S3...');
    // Use our client to send the command
    const response = await s3Client.send(command);
    console.log('S3 PUT response:', response);
  } catch (err) {
    // If anything goes wrong, log enough info that we can debug
    const { Bucket, Key } = params;
    console.error('Error uploading fragment data to S3:', err);
    console.error('Failed S3 PUT Params:', { Bucket, Key });
    throw new Error('Unable to upload fragment data');
  }
}

// Convert a stream of data into a Buffer, by collecting
// chunks of data until finished, then assembling them together.
// We wrap the whole thing in a Promise so it's easier to consume.
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    // As the data streams in, we'll collect it into an array.
    const chunks = [];

    // Streams have events that we can listen for and run
    // code.  We need to know when new `data` is available,
    // if there's an `error`, and when we're at the `end`
    // of the stream.

    // When there's data, add the chunk to our chunks list
    stream.on('data', (chunk) => chunks.push(chunk));
    // When there's an error, reject the Promise
    stream.on('error', reject);
    // When the stream is done, resolve with a new Buffer of our chunks
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Reads a fragment's data from S3 and returns (Promise<Buffer>)
// https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#getting-a-file-from-an-amazon-s3-bucket
async function readFragmentData(ownerId, id) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new GetObjectCommand(params);

  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(command);
    // Convert the ReadableStream to a Buffer
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

// Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
async function listFragments(ownerId, expand = false) {
  console.log('Listing fragments for ownerId:', ownerId);

  const fragments = await metadata.query(ownerId);
  console.log('Fragments fetched from memory:', fragments);

  if (!fragments || !Array.isArray(fragments)) {
    return [];
  }

  if (expand) {
    return fragments
      .map((fragment) => {
        try {
          return JSON.parse(fragment);
        } catch (error) {
          console.error('Error parsing fragment:', fragment, error);
          return null;
        }
      })
      .filter((fragment) => fragment !== null);
  }

  return fragments
    .map((fragment) => {
      try {
        return JSON.parse(fragment).id;
      } catch (error) {
        console.error('Error parsing fragment for ID:', fragment, error);
        return null;
      }
    })
    .filter((id) => id); // Filters out null, undefined, or empty string IDs
}

// Delete a fragment's metadata and data from memory db. Returns a Promise
async function deleteFragment(ownerId, id) {
  logger.info('Entering deleteFragment aws');
  // Define S3 delete parameters
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  logger.info('S3 DELETE params:', params);

  // Create a DELETE Object command to send to S3
  const command = new DeleteObjectCommand(params);

  try {
    // Attempt to delete the object from S3
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error deleting fragment data from S3');
    throw new Error('Unable to delete fragment data from S3');
  }
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
