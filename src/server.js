/* eslint-disable no-console */
const app = require('./app');
const knex = require('knex');
const { PORT, NODE_ENV, DATABASE_URL  } = require('./config');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

// make knex instance globally available
app.set('db', db);

// start listening
app.listen(PORT, () => {
  console.log(`Server listening in ${NODE_ENV} mode at http://localhost:${PORT}`);
});