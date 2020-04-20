require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');
const morganOption = (process.env.NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// set up middleware
app.use(morgan(morganOption));
app.use(helmet());

if (NODE_ENV === 'development') {
  app.use(cors());
} else {
  app.use(cors({
    origin: CLIENT_ORIGIN
  }));
}

// import routers
const usersRouter = require('./users/users-router');
const authRouter = require('./auth/auth-router');
const entriesRouter = require('./entries/entries-router');

// set up routes
const routes = [
  {
    url: '/api/users',
    router: usersRouter,
  },
  {
    url: '/api/auth',
    router: authRouter
  },
  {
    url: '/api/entries',
    router: entriesRouter
  }
];

// add routes to app
routes.forEach(({ url, router }) => {
  app.use(url, router);
});

// list endpoints by default
app.get('/api', (req, res) => {
  return res
    .status(200)
    .json({
      endpoints: routes.map(route => route.url)
    });
});

// say hello or something
app.get('/', (req, res) => {
  res.send('Shajara lives here');
});

// error handling
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res) => {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'Server error' } };
  } else {
    response = { message: error.message, error };
  }

  return res
    .status(500)
    .json(response);
};

app.use(errorHandler);

// the bottom line, literally
module.exports = app;