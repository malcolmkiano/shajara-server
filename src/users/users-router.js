const express = require('express');
const UsersService = require('./users-service');

/**
 * Router to handle all requests to /api/users
 */
const usersRouter = express.Router();
usersRouter.use(express.json());

usersRouter.post('/', (req, res, next) => {
  const db = req.app.get('db');
  const { first_name, email_address, password } = req.body;

  for (const field of ['first_name', 'email_address', 'password'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });

  const firstNameError = UsersService.validateFirstName(first_name);
  if (firstNameError)
    return res.status(400).json({ error: firstNameError });
  
  const emailError = UsersService.validateEmail(email_address);
  if (emailError)
    return res.status(400).json({ error: emailError });

  const passwordError = UsersService.validatePassword(password);
  if (passwordError)
    return res.status(400).json({ error: passwordError });

  UsersService.getItemByField(db, 'email_address', email_address)
    .then(user => {
      if (user)
        return res.status(400).json({
          error: 'Email address already exists'
        });

      return UsersService.hashPassword(password)
        .then(hashedPassword => {
          const newUser = {
            first_name,
            email_address: email_address.toLowerCase(), // to save me stress later
            password: hashedPassword,
            date_created: 'now()'
          };

          return UsersService.insertItem(db, newUser)
            .then(user => {
              return res
                .status(201)
                .json(UsersService.serializeUser(user));
            });
        });
    })
    .catch(next);
});

module.exports = usersRouter;