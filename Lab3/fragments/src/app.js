const express = require('express');
const app = express();
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const { authenticate } = require('./auth');

app.use(compression());
app.use(cors());

passport.use(require('./auth').strategy());
app.use(passport.initialize());

app.use('/', require('./routes'));

module.exports = app;