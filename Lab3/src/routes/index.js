const express = require('express');
const { version, author } = require('../../package.json');
const { createSuccessResponse } = require('../response');

const router = express.Router();

router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.status(200).json(createSuccessResponse({
    service: 'fragments',
    uptime: process.uptime(),
    version,
    author,
    githubUrl: 'https://github.com/dibamackie/CCP555-2025F-NSC-Diba-Makki-144420189/tree/main/Lab3'
  }));
});

router.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.status(200).json(createSuccessResponse({ uptime: process.uptime() }));
});

module.exports = router;
