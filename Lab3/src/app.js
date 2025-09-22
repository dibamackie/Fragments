const express = require('express');
const routes = require('./routes');
const apiRoutes = require('./routes/api');
const { createErrorResponse } = require('./response');

const app = express();

app.use(express.json());

app.use('/', routes);
app.use('/v1/fragments', apiRoutes);

app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json(createErrorResponse(status, message));
});

module.exports = app;
