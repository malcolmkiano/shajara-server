const express = require('express');
const AuthService = require('./auth-service');

/**
 * Router to handle all requests to /api/auth
 */
const authRouter = express.Router();
authRouter.use(express.json());

authRouter.post('/login', (req, res, next) => {
  const db = req.app.get('db');
  const { email_address, password } = req.body;
  const loginUser = { email_address, password };

  for (const [key, value] of Object.entries(loginUser))
    if (!value)
      return res.status(400).json({
        error: `Missing '${key}' in request body`
      });
  
  AuthService.getItemByField(db, 'email_address', email_address.toLowerCase())
    .then(dbUser => {
      if (!dbUser)
        return res.status(400).json({
          error: 'Incorrect email address or password'
        });
      
      return AuthService.comparePasswords(loginUser.password, dbUser.password)
        .then(compareMatch => {
          if (!compareMatch)
            return res.status(400).json({
              error: 'Incorrect email address or password'
            });

          const sub = dbUser.email_address;
          const payload = { user_id: dbUser.id };
          return res.status(200).json({
            first_name: dbUser.first_name,
            authToken: AuthService.createJwt(sub, payload)
          });
        });   
    })
    .catch(next);
});

module.exports = authRouter;