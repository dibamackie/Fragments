//src\routes\api\delete.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * DELETE /v1/fragments/:id - Deletes a fragment by ID
 */
module.exports = async (req, res) => {
  try {
    const userId = req.user; // Assuming authentication middleware sets req.user
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json(createErrorResponse('Unauthorized', 401));
    }

    logger.info(`User ${userId} requested to delete fragment: ${id}`);

    // Find the fragment by ID
    let fragment;
    try {
      fragment = await Fragment.byId(userId, id);
      logger.info(`Fragment ${fragment.id} found for user ${fragment.ownerId}`);
    } catch (error) {
      logger.error(`Fragment ${id} not found for user ${userId} ` + error);
      return res.status(404).json(createErrorResponse('Fragment not found', 404));
    }

    // Delete the fragment
    try {
      // Attempt to delete the fragment
      await Fragment.delete(userId, id);
      logger.info(`Fragment ${id} deleted successfully for user ${userId}`);

      res
        .status(200)
        .json(createSuccessResponse({ message: `Fragment ${id} deleted successfully.` }));
    } catch (error) {
      logger.error(`Error deleting fragment ${id} for user ${userId}: FRAGMENT`, error);
      res.status(500).json(createErrorResponse('Internal server error delete', 500));
    }
  } catch (error) {
    logger.error(`Error deleting fragment ${req.params.id}:`, error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
};
