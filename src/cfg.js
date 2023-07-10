const dotenv = require('dotenv');

dotenv.config();

function getEnv(env, defaultValue = null) {
  const value = process.env[env] || defaultValue;
  if (value != null) {
    return value;
  }

  throw new Error(`Missing environment variable: ${env}`);
}

module.exports = {
  port: getEnv('PORT', 3000),
  mnemonic: getEnv('MNEMONIC'),
  passphrase: getEnv('PASSPHRASE', ''),
};
