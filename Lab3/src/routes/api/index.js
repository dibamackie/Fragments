const express = require('express');
const getRouter = require('./get');

const router = express.Router();

router.use('/', getRouter);

module.exports = router;
