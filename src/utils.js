import { cryptoNetworks } from './cfg.js';

export function symbolValidator(symbol, helpers) {
  const cryptoSymbols = Object.keys(cryptoNetworks);

  if (cryptoSymbols.includes(symbol.toUpperCase())) {
    return symbol.toUpperCase();
  }

  return helpers.message(
    '"symbol" must be one of [' + cryptoSymbols.join(', ') + ']',
  );
}

export function networkValidator(network, helpers) {
  const symbol = helpers.state.ancestors[0].symbol;
  const cryptoSymbols = Object.keys(cryptoNetworks);

  if (!cryptoSymbols.includes(symbol.toUpperCase())) {
    return helpers.message(
      '"symbol" must be one of [' + cryptoSymbols.join(', ') + ']',
    );
  }

  const networks = cryptoNetworks[symbol.toUpperCase()];
  for (const net of networks) {
    if (net.toLowerCase() === network.toLowerCase()) {
      return net;
    }
  }

  return helpers.message(
    '"network" must be one of [' + networks.join(', ') + ']',
  );
}

export function getCoinType(symbol, network, walletCore) {
  /** @type {import('@trustwallet/wallet-core').WalletCore} */
  const { CoinType } = walletCore;

  if (network) {
    return CoinType[network.toLowerCase()];
  }

  const defaultNetwork = cryptoNetworks[symbol.toUpperCase()][0];
  return CoinType[defaultNetwork.toLowerCase()];
}

export function toHexString(byteArray) {
  return Array.from(byteArray, (byte) =>
    `0${(byte & 0xff).toString(16)}`.slice(-2),
  ).join('');
}

export function toTimestamp(date) {
  return Date.parse(date) / 1000; // Convert to seconds.
}

export function apiError(messages, statusCode) {
  const err = new Error();
  err.statusCode = statusCode;
  err.messages = messages;
  return err;
}

export function fromSatoshi(n) {
  return n / 100000000;
}

export function toSatoshi(n) {
  return Math.round(n * 100000000);
}

export function fromWei(n) {
  return n / 1000000000000000000;
}

export function toWei(n) {
  return n * 1000000000000000000;
}
