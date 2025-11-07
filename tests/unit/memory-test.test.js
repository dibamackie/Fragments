// Fix this path to point to your project's `memory-db.js` source file
const {
  writeFragment,
  readFragment,
  writeFragmentData, 
  readFragmentData, 
  listFragments, 
  deleteFragment
} = require('../../src/model/data/memory/index');

describe('memory-test-index', () => {
  let fragment;
  let buffer;

  // Each test will get its own, empty database instance
  beforeEach(() => {
    // Reset the databases for each test to ensure isolation
    fragment = { ownerId: 'user1', id: 'frag1', data: 'test' };
    buffer = Buffer.from('some data');
  });

  test('writeFragment() stores metadata in metadata DB', async () => {
    await writeFragment(fragment);

    // Access the fragment from metadata using readFragment
    const stored = await readFragment(fragment.ownerId, fragment.id);
    expect(stored).toEqual(fragment);
  });

  test('writeFragmentData() stores data in data DB', async () => {
    await writeFragmentData(fragment.ownerId, fragment.id, buffer);

    const storedData = await readFragmentData(fragment.ownerId, fragment.id);
    expect(storedData).toEqual(buffer);
  });

  test('listFragments() lists fragments for a user', async () => {
    // Write multiple fragments
    await writeFragment({ ownerId: 'user1', id: 'frag1', data: 'test' });
    await writeFragment({ ownerId: 'user1', id: 'frag2', data: 'test2' });

    const fragments = await listFragments('user1');
    expect(fragments).toEqual(['frag1', 'frag2']);
  });

  test('listFragments() returns expanded fragments when expand is true', async () => {
    // Write multiple fragments
    await writeFragment({ ownerId: 'user1', id: 'frag1', data: 'test' });
    await writeFragment({ ownerId: 'user1', id: 'frag2', data: 'test2' });
  
    const fragments = await listFragments('user1', true);
    expect(fragments).toEqual([
      { ownerId: 'user1', id: 'frag1', data: 'test' },
      { ownerId: 'user1', id: 'frag2', data: 'test2' },
    ]);
  });

  test('deleteFragment() deletes fragment from metadata and data DB', async () => {
    // Write the fragment
    await writeFragment(fragment);
    await writeFragmentData(fragment.ownerId, fragment.id, Buffer.from('test data'));
  
    // Delete the fragment
    await deleteFragment(fragment.ownerId, fragment.id);
  
    // Verify that fragment and data are deleted by checking for undefined
    const storedMetadata = await readFragment(fragment.ownerId, fragment.id);
    expect(storedMetadata).toBeUndefined();  // Expect undefined instead of rejection
    
    const storedData = await readFragmentData(fragment.ownerId, fragment.id);
    expect(storedData).toBeUndefined();  // Expect undefined for data as well
  });

  test('deleteFragment() throws error if fragment does not exist', async () => {
    // Try to delete a fragment that doesn't exist
    await expect(deleteFragment('user1', 'frag1')).rejects.toThrow(
      'missing entry for primaryKey=user1 and secondaryKey=frag1'
    );
  });
});
