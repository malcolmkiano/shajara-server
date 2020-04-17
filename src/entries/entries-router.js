const express = require('express');
const EntriesService = require('./entries-service');
const { requireAuth } = require('../middleware/jwt-auth');

/**
 * Router to handle all requests to /entries
 */
const entriesRouter = express.Router();

entriesRouter.get('/', requireAuth, (req, res, next) => {
  const db = req.app.get('db');
  EntriesService.getUserEntries(db, req.user)
    .then(entries => {
      return res.status(200).json(entries);
    })
    .catch(next);
});

module.exports = entriesRouter;