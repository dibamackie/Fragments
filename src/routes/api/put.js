const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const userId = req.user;
    const fragmentId = req.params.id;
    const newData = req.body;
    const contentType = req.headers['content-type'];

    if (!userId) {
      return res.status(401).json(createErrorResponse('Unauthorized', 401));
    }

    if (!Buffer.isBuffer(newData) || newData.length === 0) {
      return res.status(400).json(createErrorResponse('Invalid body format, expected raw binary data.', 400));
    }

    let fragment;
    try {
      fragment = await Fragment.byId(userId, fragmentId);
    } catch (error) {
      logger.error(`Fragment ${fragmentId} not found for user ${userId}:`, error);
      return res.status(404).json(createErrorResponse('Fragment not found', 404));
    }

    // Ensure the type hasn't changed
    if (fragment.type !== contentType) {
      return res.status(400).json(createErrorResponse('Content-Type does not match the existing fragment type.', 400));
    }

    // Update fragment data
    await fragment.setData(newData);
    fragment.updated = new Date();
    fragment.size = newData.length;
    await fragment.save();

    logger.info(`Fragment ${fragment.id} updated for user ${userId}`);

    const updatedMetadata = {
      id: fragment.id,
      created: fragment.created,
      updated: fragment.updated,
      ownerId: fragment.ownerId,
      type: fragment.type,
      size: fragment.size,
      formats: [fragment.type]
    };

    res.status(200).json(createSuccessResponse({ fragment: updatedMetadata }));
  } catch (error) {
    logger.error('Error updating fragment:', error);
    res.status(500).json(createErrorResponse('Internal server error', 500));
  }
};
