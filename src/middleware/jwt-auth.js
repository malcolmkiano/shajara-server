const AuthService = require('../auth/auth-service');
const CryptoService = require('../crypto-service');

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';
  const db = req.app.get('db');

  let bearerToken;
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  try {
    const payload = AuthService.verifyJwt(bearerToken);

    const encryptedEmail = CryptoService.encrypt(payload.sub);
    AuthService.getItemByField(db, 'email_address', encryptedEmail)
      .then(user => {
        if (!user)
          return res.status(401).json({ error: 'Unauthorized request' });

        req.user = user;
        next();
      })
      .catch(next);
  } catch(error) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
}

module.exports = {
  requireAuth
};