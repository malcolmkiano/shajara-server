const Service = require('../base-service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

class AuthService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  }

  createJwt(subject, payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      subject,
      algorithm: 'HS256'
    });
  }

  verifyJwt(token) {
    return jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256']
    });
  }
}

module.exports = new AuthService('shajara_users');