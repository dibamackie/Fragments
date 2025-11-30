const { createSuccessResponse } = require('../../response');
const { listFragments } = require('../../model/data');
const { Fragment } = require('../../model/fragment');
const markdownIt = require('markdown-it');
const sharp = require('sharp');
const yaml = require('js-yaml');

module.exports = async (req, res) => {
  try {
    const userId = req.user;
    if (!userId) {
      console.warn('No authenticated user found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`User ID: ${userId}`);

    if (req.params.id) {
      let { id } = req.params;
      const possibleExt = id.match(/\.(txt|md|html|csv|json|ya?ml|png|jpe?g|webp|gif|avif)$/i);
      const extension = possibleExt ? possibleExt[0] : '';
      const fragmentId = extension ? id.slice(0, -extension.length) : id;

      console.log(`Requested fragment ID: ${fragmentId}`);
      console.log(`Requested extension: ${extension || '(none)'}`);

      let fragment;
      try {
        fragment = await Fragment.byId(userId, fragmentId);
        console.log(`Fragment found: ${fragment.id}, type: ${fragment.type}, size: ${fragment.size}`);
      } catch (error) {
        console.error(`Fragment not found for ID ${fragmentId}:`, error);
        return res.status(404).json({ error: 'Fragment not found.' });
      }

      let fragmentData;
      try {
        fragmentData = await fragment.getData();
        console.log(`Retrieved fragment data: ${fragmentData.length} bytes`);
      } catch (error) {
        console.error(`Error getting data for fragment ${fragmentId}:`, error);
        return res.status(404).json({ error: 'Fragment data not found.' });
      }

      const originalMime = fragment.mimeType || fragment.type;
      console.log(`Original MIME type: ${originalMime}`);

      const supportedConversions = {
        'text/plain': ['.txt'],
        'text/markdown': ['.md', '.html', '.txt'],
        'text/html': ['.html', '.txt'],
        'text/csv': ['.csv', '.txt', '.json'],
        'application/json': ['.json', '.yaml', '.yml', '.txt'],
        'application/yaml': ['.yaml', '.txt'],
        'image/png': ['.png', '.jpg', '.webp', '.gif', '.avif'],
        'image/jpeg': ['.png', '.jpg', '.webp', '.gif', '.avif'],
        'image/webp': ['.png', '.jpg', '.webp', '.gif', '.avif'],
        'image/avif': ['.png', '.jpg', '.webp', '.gif', '.avif'],
        'image/gif': ['.png', '.jpg', '.webp', '.gif', '.avif'],
      };

      const extToMime = {
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.html': 'text/html',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.yaml': 'application/yaml',
        '.yml': 'application/yaml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.avif': 'image/avif',
      };

      if (!extension) {
        console.log('No extension provided. Returning raw fragment.');
      
        res.writeHead(200, {
          'Content-Type': fragment.type,
          'Content-Length': fragmentData.length
        });
      
        console.log(`Sending raw binary data with Content-Type: ${fragment.type}, length: ${fragmentData.length}`);
        res.end(fragmentData); // ✅ send Buffer directly
        return;
      }

      const allowedExt = supportedConversions[originalMime];
      if (!allowedExt || !allowedExt.includes(extension)) {
        console.warn(`Unsupported extension ${extension} for MIME type ${originalMime}`);
        return res.status(415).json({ error: 'Unsupported file extension or conversion type.' });
      }

      let resultBuffer = fragmentData;
      let outputMime = extToMime[extension];
      console.log(`Target extension ${extension} mapped to MIME: ${outputMime}`);

      if (originalMime.startsWith('text') || originalMime.startsWith('application')) {
        const raw = fragmentData.toString('utf-8');
        console.log(`Raw text preview: ${raw.slice(0, 100)}...`);

        switch (extension) {
          case '.html':
            if (originalMime === 'text/markdown' && extension === '.html') {
              console.log('Converting Markdown to HTML');
              resultBuffer = Buffer.from(markdownIt().render(raw), 'utf-8');
            } else {
              console.log('Performing generic text conversion');
              resultBuffer = Buffer.from(raw, 'utf-8');
            }
            break;
          case '.json':
            if (originalMime === 'text/csv') {
              console.log('Converting CSV to JSON');
              const lines = raw.trim().split('\n');
              const headers = lines[0].split(',');
              const rows = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, h, i) => (obj[h] = values[i], obj), {});
              });
              resultBuffer = Buffer.from(JSON.stringify(rows, null, 2), 'utf-8');
            } else if (originalMime === 'application/yaml') {
              console.log('Converting YAML to JSON');
              resultBuffer = Buffer.from(JSON.stringify(yaml.load(raw), null, 2), 'utf-8');
            }
            break;
          case '.yaml':
          case '.yml':
            if (originalMime === 'application/json') {
              console.log('Converting JSON to YAML');
              resultBuffer = Buffer.from(yaml.dump(JSON.parse(raw)), 'utf-8');
            }
            break;
          default:
            console.log('Performing generic text conversion');
            resultBuffer = Buffer.from(raw, 'utf-8');
        }
      } else if (originalMime.startsWith('image')) {
        try {
          console.log(`Converting image to ${extension}`);
        
          switch (extension) {
            case '.jpg':
            case '.jpeg':
              resultBuffer = await sharp(fragmentData).jpeg().toBuffer();
              break;
            case '.png':
              resultBuffer = await sharp(fragmentData).png().toBuffer();
              break;
            case '.webp':
              resultBuffer = await sharp(fragmentData).webp().toBuffer();
              break;
            case '.gif':
              resultBuffer = await sharp(fragmentData).gif().toBuffer();
              break;
            case '.avif':
              resultBuffer = await sharp(fragmentData).avif().toBuffer();
              break;
            default:
              throw new Error(`Unsupported image conversion: ${extension}`);
          }
        } catch (err) {
          console.error(`Sharp conversion error: ${err.message}`);
          return res.status(500).json({ error: 'Image conversion failed.' });
        }
      }

      console.log(`Sending converted data with Content-Type: ${outputMime}, length: ${resultBuffer.length}`);
      res.writeHead(200, {
        'Content-Type': outputMime,
        'Content-Length': resultBuffer.length,
      });
      res.end(resultBuffer);
      return;
    }

    console.log('No :id param. Returning fragment list');
    const expand = req.query.expand === '1';
    const fragments = await listFragments(userId, expand);
    console.log(`Returning ${fragments.length} fragments`);
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    console.error('Unhandled error in GET /fragments:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
