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

export const supportedSymbolsMap = {
  BTC: 0,
  LTC: 2,
  ETH: 60,
  DOGE: 3,
  USDT: 60,
  USDC: 60,
  ADA: 1815,
  SOL: 501,
};
export const supportedSymbols = Object.keys(supportedSymbolsMap);

export function getChainId(symbol) {
  return supportedSymbolsMap[symbol];
}
