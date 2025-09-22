const express = require('express');
const { createSuccessResponse, createErrorResponse } = require('../../response');

const router = express.Router();

const DEFAULT_TOKEN = process.env.VALID_TOKEN || 'Bearer demo-token';

// Simple in-memory collection that mimics a per-user fragments store
const FRAGMENTS_BY_TOKEN = {
  [DEFAULT_TOKEN]: [
    {
      id: 'frag-1',
      type: 'text/plain',
      size: 24
    },
    {
      id: 'frag-2',
      type: 'application/json',
      size: 64
    }
  ]
};

router.get('/', (req, res) => {
  const authorization = req.get('Authorization');

  if (!authorization) {
    return res.status(401).json(createErrorResponse(401, 'authorization header required'));
  }

  const fragments = FRAGMENTS_BY_TOKEN[authorization];

  if (!fragments) {
    return res.status(403).json(createErrorResponse(403, 'invalid or expired credentials'));
  }

  return res.status(200).json(createSuccessResponse({ fragments }));
});

module.exports = router;
