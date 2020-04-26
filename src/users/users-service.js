const Service = require('../base-service');
const bcrypt = require('bcryptjs');
const CryptoService = require('../crypto-service');

const REGEX_ALPHA_NO_SPACES_OR_NUMBERS = /^[A-Za-z'-]+$/;
const REGEX_VALID_EMAIL = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const REGEX_UPPER_LOWER_NUMBER = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])+/;

class UsersService extends Service {
  constructor(table_name) {
    super(table_name);
  }

  validateFirstName(first_name) {
    first_name = first_name.toString();
    if (first_name.length < 2) {
      return 'First name must be 2 or more characters';
    }

    if (first_name.length > 30) {
      return 'First name must be less than 30 characters';
    }

    if (!REGEX_ALPHA_NO_SPACES_OR_NUMBERS.test(first_name)) {
      return 'First name must contain only alphabetic characters and no spaces';
    }
  }

  validateEmail(email_address) {
    email_address = email_address.toString();
    if (!REGEX_VALID_EMAIL.test(email_address)) {
      return 'Email address must be valid';
    }
  }

  validatePassword(password) {
    password = password.toString();
    if (password.length < 8) {
      return 'Password must be 8 or more characters';
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
    let { first_name, email_address } = user;
    first_name = CryptoService.decrypt(first_name);
    email_address = CryptoService.decrypt(email_address);

    return {
      id: user.id,
      first_name,
      email_address,
      date_created: new Date(user.date_created).toISOString()
    };
  }
}

module.exports = new UsersService('shajara_users');