import { config } from 'dotenv';

config();

function getEnv(env, defaultValue = null) {
  const value = process.env[env] || defaultValue;
  if (value != null) {
    return value;
  }

  throw new Error(`Missing environment variable: ${env}`);
}

export const port = getEnv('PORT', 3000);
export const mnemonic = getEnv('MNEMONIC');
export const passphrase = getEnv('PASSPHRASE', '');
export const blockchairAPIKey = getEnv('BLOCKCHAIR_API_KEY', '');

export const cryptoNetworks = {
  BTC: ['Bitcoin'],
  LTC: ['Litecoin'],
  ETH: ['Ethereum'],
  DOGE: ['Dogecoin'],
  ADA: ['Cardano'],
};
