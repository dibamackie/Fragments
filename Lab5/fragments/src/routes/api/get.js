const { createSuccessResponse, createErrorResponse } = require('../../response');
const { listFragments } = require('../../model/data/memory/index'); // Import readFragment for expanded data

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const userId = req.user; // Assuming req.user contains the authenticated user ID

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const expand = req.query.expand === '1'; // If expand=1 is passed, return full metadata

    // Get the list of fragment ids (or full metadata if expand is true)
    const fragments = await listFragments(userId, expand);

    // Log the fragments and status to the console
    console.log({
      status: 'ok',
      fragments: fragments,
    });

    // Return success response with fragments data
    res.status(200).json(
      createSuccessResponse({
        fragments: fragments, // This will either be just the fragment IDs or full metadata
      })
    );
  } catch (err) {
    // Handle errors
    console.error('Error fetching fragments:', err); // Log error
    res.status(500).json(createErrorResponse('Internal server error.'));
  }
};
