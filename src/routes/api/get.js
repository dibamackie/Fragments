const { createSuccessResponse } = require('../../response');
const { listFragments } = require('../../model/data/memory/index'); // Import readFragment for expanded data
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const markdownIt = require('markdown-it');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const userId = req.user; // Assuming req.user contains the authenticated user ID

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // If the request has an ID parameter, return a specific fragment
    if (req.params.id) {
      let { id } = req.params;  // Extract fragmentId
      logger.info(`Fetching fragment ${id} for user ${userId}`);
      
      // Extract the extension (if any) from the fragmentId, including the dot
      const extension = id.includes('.') ? id.slice(id.lastIndexOf('.')) : '';  // Everything after the last dot
      logger.info(`File extension: ${extension}`);
      
      // Store the extension for later use, and remove the extension from fragmentId for querying
      const fragmentId = extension ? id.slice(0, id.lastIndexOf('.')) : id;

      // Log the fragmentId and the extracted extension
      logger.info(`Fragment ID for querying: ${fragmentId}`);

      let fragment;
      try {
        fragment = await Fragment.byId(userId, fragmentId);
      } catch (error) {
        logger.error(`Error fetching fragment ${id} for user ${userId}:`, error);
        return res.status(404).json({ error: 'Fragment not found.' });
      }

      logger.info('Fragment found:', fragment);

      let fragmentData;
      try {
        fragmentData = await fragment.getData();
      } catch (error) {
        logger.error(`Error retrieving data for fragment ${id}:`, error);
        return res.status(404).json({ error: 'Fragment data not found.' });
      }
      
      // Handle conversion based on the file extension
      let dataString = '';
      let contentType = fragment.type;


      if (!extension) {
        // No extension provided, return raw fragment data
        if (!fragment.isText) {
          dataString = fragmentData.toString('base64'); // Convert binary data to base64
          contentType = fragment.type;  // Set the appropriate content type for binary data
        } else {
          dataString = fragmentData.toString('utf-8'); // Return raw text data
          contentType = fragment.type;  
        }
        console.log('Content type:', contentType);
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': fragment.size
        });
        res.end(dataString);

        return;
      }

      
      // Process extensions and conversions
      if (extension === '.html' && (fragment.type === 'text/plain' || fragment.type === 'text/markdown')) {
        // Convert Markdown to HTML
        const md = markdownIt();
        dataString = md.render(fragmentData.toString('utf-8'));
        console.log('HTML get:', dataString);
        contentType = 'text/html';
      } else if (extension === '.txt' && fragment.isText) {
        dataString = fragmentData.toString('utf-8');
        contentType = 'text/plain';
      } else if (extension === '.md' && fragment.isText) {
        dataString = fragmentData.toString('utf-8');
        contentType = 'text/markdown';
      } else if (
        extension &&
        (!['.md', '.html', '.txt'].includes(extension) || 
        !['text/plain', 'text/markdown', 'text/html'].includes(fragment.type))
      ) {
        return res.status(415).json({ error: 'Unsupported file extension or conversion type.' });
      }
      
      // Return the fragment's data with the appropriate content type
      console.log("data string", dataString);
      res.writeHead(200, {
        'Content-Type': contentType, // Ensure no charset
        'Content-Length': fragment.size
      });
      res.end(dataString);
      return;
    }

    // No id parameter, return a list of fragments
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
    res.status(500).json({ error: 'Internal server error.' });
  }
  
};
