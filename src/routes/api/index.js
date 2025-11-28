// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');

// Create a router on which to mount our API endpoints
const router = express.Router();

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));

// Define route for getting a specific fragment by ID
router.get('/fragments/:id', require('./get')); //Assignment 2

// Define route for getting a specific fragment by ID with additional info
router.get('/fragments/:id/info', require('./getFragmentInfo')); //Assignment 2

// Middleware to validate body and content type
router.post('/fragments', rawBody(), require('./post'));

router.delete('/fragments/:id', require('./delete'));

module.exports = router;
