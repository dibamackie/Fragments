const MemoryDB = require('./memory-db');

// Create two in-memory databases: one for fragment metadata and the other for raw data
const data = new MemoryDB();
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

// Write a fragment's data buffer to memory db. Returns a Promise
function writeFragmentData(ownerId, id, buffer) {
  return data.put(ownerId, id, buffer);
}

// Read a fragment's data from memory db. Returns a Promise
function readFragmentData(ownerId, id) {
  return data.get(ownerId, id);
}

// Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
async function listFragments(ownerId, expand = false) {
  console.log('entering listFragments memory onboard');
  console.log("Listing fragments for ownerId:", ownerId);

  const fragments = await metadata.query(ownerId);
  console.log("Fragments fetched from memory:", fragments);

  if (!fragments || !Array.isArray(fragments)) {
    return [];
  }

  if (expand) {
    return fragments
      .map(fragment => {
        try {
          return JSON.parse(fragment);
        } catch (error) {
          console.error("Error parsing fragment:", fragment, error);
          return null; 
        }
      })
      .filter(fragment => fragment !== null); 
  }

  return fragments
    .map((fragment) => {
      try {
        return JSON.parse(fragment).id;
      } catch (error) {
        console.error("Error parsing fragment for ID:", fragment, error);
        return null;
      }
    })
    .filter(id => id); // Filters out null, undefined, or empty string IDs
}

// Delete a fragment's metadata and data from memory db. Returns a Promise
async function deleteFragment(ownerId, id) {
  console.log('entering deleteFragment memory onboard');

    console.log(`Deleting fragment metadata for ownerId: ${ownerId}, id: ${id}`);
    await metadata.del(ownerId, id);
    
    console.log(`Deleting fragment data for ownerId: ${ownerId}, id: ${id}`);
    await data.del(ownerId, id);

    console.log(`Successfully deleted fragment ${id} for owner ${ownerId}`);
    return Promise.resolve();
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
