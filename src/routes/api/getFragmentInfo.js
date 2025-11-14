const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const userId = req.user; // Assuming req.user contains the authenticated user ID
    const fragmentId = req.params.id; // Get the fragment ID from the URL

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    let fragment;

    try {
      fragment = await Fragment.byId(userId, fragmentId);
    } catch (error) {
      logger.error(`Error fetching fragment ${fragmentId} for user ${userId}:`, error);
      return res.status(404).json({ error: 'Fragment not found.' });
    }

    // Return the metadata of the fragment
    const metadata = {
      id: fragment.id,
      ownerId: fragment.ownerId,
      created: fragment.created,
      updated: fragment.updated,
      type: fragment.type,
      size: fragment.size,
    };

    return res.status(200).json(createSuccessResponse({ fragment: metadata }));
  } catch (err) {
    console.error('Error fetching fragment metadata:', err);
    res.status(500).json(createErrorResponse('Internal server error.'));
  }
};
