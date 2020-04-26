const crypto = require('crypto');
const { ENCRYPTION_KEY } = require('./config');

let key = ENCRYPTION_KEY;
let iv = Buffer.alloc(16, 0);

const CryptoService = {

  // encrypt a string
  encrypt: value => {
    let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(value, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  },

  // decrypt a string
  decrypt: value => {
    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(value, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  }

};

module.exports = CryptoService;