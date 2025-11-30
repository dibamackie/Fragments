const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json(createErrorResponse('Unauthorized', 401));
    }

    logger.info(`User ${userId} requested to delete fragment: ${id}`);

    const fragment = await Fragment.byId(userId, id);

    if (!fragment) {
      logger.warn(`Fragment ${id} not found for user ${userId}`);
      return res.status(404).json(createErrorResponse('Fragment not found', 404));
    }

    await Fragment.delete(userId, id);
    logger.info(`Fragment ${id} deleted successfully for user ${userId}`);

    return res.status(200).json(createSuccessResponse({ message: `Fragment ${id} deleted successfully.` }));
  } catch (error) {
    logger.error(`Error deleting fragment ${req.params.id}:`, error);
    return res.status(500).json(createErrorResponse('Internal server error', 500));
  }
};
