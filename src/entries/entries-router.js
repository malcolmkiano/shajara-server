const express = require('express');
const EntriesService = require('./entries-service');
const { requireAuth } = require('../middleware/jwt-auth');

/**
 * Router to handle all requests to /entries
 */
const entriesRouter = express.Router();
entriesRouter.use(express.json());
entriesRouter.use(requireAuth);

// get all a user's entries
entriesRouter.get('/', (req, res, next) => {
  const db = req.app.get('db');
  EntriesService.getUserEntries(db, req.user)
    .then(entries =>
      res.status(200).json(entries.map(EntriesService.serializeEntry))
    )
    .catch(next);
});

// post a new entry
entriesRouter.post('/', (req, res, next) => {
  const db = req.app.get('db');
  const { content, mood } = req.body;
  const newEntry = { content, mood };

  for (const [key, value] of Object.entries(newEntry))
    if (!value)
      return res.status(400).json({
        error: `Missing '${key}' in request body`
      });

  newEntry.user_id = req.user.id;

  EntriesService.insertItem(db, newEntry)
    .then(entry =>
      res.status(201).json(EntriesService.serializeEntry(entry))
    )
    .catch(next);
});

// update an entry
entriesRouter.patch('/:id', (req, res, next) => {
  const db = req.app.get('db');
  const { id } = req.params;
  const { content, mood } = req.body;
  const entryToUpdate = { content, mood };

  EntriesService.getItemById(db, id)
    .then(dbEntry => {
      if (!dbEntry)
        return res.status(404).json({
          error: 'Entry doesn\'t exist'
        });
      
      const numberOfValues = Object.values(entryToUpdate).filter(Boolean).length;
      if (numberOfValues === 0)
        return res.status(400).json({
          error: 'Request body must contain content'
        });

      EntriesService.updateItem(db, id, entryToUpdate)
        .then(() =>
          res.status(204).end()
        );
    })
    .catch(next);
});

module.exports = entriesRouter;