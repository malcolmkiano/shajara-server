const Service = require('../base-service');
const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])+/;

class UsersService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  validatePassword(password) {
    password = password.toString();
    if (password.length < 8) {
      return 'Password must be longer than 8 characters';
    }
    
    if (password.length > 72) {
      return 'Password must be less than 72 characters';
    }

    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }

    if (!REGEX_UPPER_LOWER_NUMBER.test(password)) {
      return 'Password must contain at least 1 uppercase, lowercase and number characters';
    }
  }

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  serializeUser(user) {
    return {
      id: user.id,
      first_name: user.first_name,
      email_address: user.email_address,
      date_created: new Date(user.date_created)
    };
  }
}

module.exports = new UsersService('shajara_users');