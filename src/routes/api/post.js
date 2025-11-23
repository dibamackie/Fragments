const { Fragment } = require('../../model/fragment');

const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    // Log the authenticated user (info log to keep track of the user making the request)
    logger.info('Authenticated user:', req.user);

    // Log the request body and Content-Type (debug log to track incoming data)
    logger.debug('Request body:', req.body);
    console.log('Content-Type header:', req.headers['content-type']);

    // Check if body is a Buffer and not empty (warn level log if the body is invalid)
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      logger.warn('Invalid body format or empty body.');
      return res.status(400).json({ error: 'Invalid body format, expected raw binary data.' });
    }

    // Parse Content-Type header to determine the type of data (debug log to track type parsing)
    const type = req.headers['content-type'];
    console.log('Parsed Content-Type:', type);

    // Check if the Content-Type is supported (warn level log for unsupported types)
    if (!Fragment.isSupportedType(type)) {
      logger.warn(`Unsupported Content-Type: ${type}`);
      return res.status(415).json({ error: 'Unsupported Content-Type.' });
    }

    // Ensure user authentication is valid (warn level log for unauthorized access)
    if (!req.user) {
      logger.warn('User authentication failed');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Log the creation of the new fragment (info log for regular operations)
    const ownerId = req.user;  // Assuming user ID is stored in req.user
    const fragment = new Fragment({
      ownerId,
      type,
      size: req.body.length,
    });
    logger.info('Fragment object created:', fragment);

    // Save the fragment metadata (info log to confirm successful metadata storage)
    await fragment.save();
    logger.info('Fragment metadata saved.');

    // Store the raw binary data in the fragment (info log to confirm data storage)
    await fragment.setData(req.body);
    logger.info('Raw data stored in fragment.');

    // Generate the Location header using the API_URL or request's host (info log for URL generation)
    const apiUrl = process.env.API_URL || `http://${req.headers.host}`;
    const locationUrl = new URL(`/v1/fragments/${fragment.id}`, apiUrl).toString();
    logger.info('Generated Location URL:', locationUrl);

    console.log(fragment.type);
    // Log the successful creation response and fragment details
    logger.info('Fragment creation response:', {
      status: 'ok',
      fragment: {
        id: fragment.id,
        created: fragment.created,
        updated: fragment.updated,
        ownerId: fragment.ownerId,
        type: fragment.type,
        size: fragment.size,
      },
    });

    // Set the Location header and respond (info log for successful response)
    res.setHeader('Location', locationUrl);

    // Construct the response body
    const responseBody = {
      status: 'ok',
      message: 'Fragment created successfully',
      fragment: {
        id: fragment.id,
        created: fragment.created,
        updated: fragment.updated,
        ownerId: fragment.ownerId,
        type: fragment.type,
        size: fragment.size,
      },
    };

    // Send a success response with status code 201 (Created) and the fragment ID
    res.status(201).json(responseBody);

    logger.info('Fragment created with ID:', fragment.id);

  } catch (err) {
    // Log the unexpected error (error log for unexpected issues)
    logger.error('Error processing fragment:', err);
    
    // Handle any unexpected errors
    res.status(500).json({ error: 'Internal server error.' });
  }
};
