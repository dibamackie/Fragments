// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const authenticate = require('./auth');
const { createErrorResponse } = require('./response');

const logger = require('./logger');
const pino = require('pino-http')({
  logger,
});

// If you want version/author in health response:
const { version, author } = require('../package.json');

// Create an express app instance
const app = express();

// Common middlewares
app.use(compression());
app.use(pino);
app.use(helmet());
app.use(cors({
  exposedHeaders: ['Location', 'ETag'],
}));


// ✅ PUBLIC health check route (no auth)
app.get('/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version,
    author,
  });
});

// ✅ Set up passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// ✅ All other routes (can be protected inside ./routes)
app.use('/', require('./routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// Error-handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, 'Error processing request');
  }

  res.status(status).json(createErrorResponse(status, message));
});

module.exports = app;
