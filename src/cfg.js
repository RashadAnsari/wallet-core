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

export const cryptoChainIds = {
  BTC: [0],
  LTC: [2],
  ETH: [60],
  DOGE: [3],
  ADA: [1815],
};

export function symbolValidator(symbol, helpers) {
  const cryptoSymbols = Object.keys(cryptoChainIds);

  if (cryptoSymbols.includes(symbol.toUpperCase())) {
    return symbol.toUpperCase();
  }

  return helpers.message(
    '"symbol" must be one of [' + cryptoSymbols.join(', ') + ']',
  );
}

export function getChainId(symbol, chainId = null) {
  if (!chainId) {
    return cryptoChainIds[symbol.toUpperCase()][0];
  }

  const chainIds = cryptoChainIds[symbol.toUpperCase()];
  if (chainIds.includes(chainId)) {
    return chainId;
  }

  const error = new Error(`Invalid chainId ${chainId} for symbol ${symbol}`);
  error.statusCode = 400;

  throw error;
}
