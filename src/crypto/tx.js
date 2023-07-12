import axios from 'axios';
import { blockchairAPIKey } from '../cfg.js';
import { toTimestamp } from '../utils.js';

const transactionInfoAPIs = {
  BTC: {
    txInfoUrl:
      'https://api.blockchair.com/bitcoin/dashboards/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/bitcoin/stats',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['block_id'];
      if (blockHeight === -1) {
        return 0;
      }

      const lastBlockHeight = lastBlock
        ? lastBlock['context']['state']
        : txInfo['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 6,
  },
  LTC: {
    txInfoUrl:
      'https://api.blockchair.com/litecoin/dashboards/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/litecoin/stats',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['block_id'];
      if (blockHeight === -1) {
        return 0;
      }

      const lastBlockHeight = lastBlock
        ? lastBlock['context']['state']
        : txInfo['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 24,
  },
  ETH: {
    txInfoUrl:
      'https://api.blockchair.com/ethereum/dashboards/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/ethereum/stats',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['block_id'];
      if (blockHeight === -1) {
        return 0;
      }

      const lastBlockHeight = lastBlock
        ? lastBlock['context']['state']
        : txInfo['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 12,
  },
  DOGE: {
    txInfoUrl:
      'https://api.blockchair.com/dogecoin/dashboards/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/dogecoin/stats',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['block_id'];
      if (blockHeight === -1) {
        return 0;
      }

      const lastBlockHeight = lastBlock
        ? lastBlock['context']['state']
        : txInfo['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 10,
  },
  USDT: {
    txInfoUrl:
      'https://api.blockchair.com/ethereum/dashboards/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/ethereum/stats',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['block_id'];
      if (blockHeight === -1) {
        return 0;
      }

      const lastBlockHeight = lastBlock
        ? lastBlock['context']['state']
        : txInfo['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 12,
  },
  ADA: {
    txInfoUrl:
      'https://api.blockchair.com/cardano/raw/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/cardano/stats',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['ctsBlockHeight'];
      if (blockHeight === -1) {
        return 0;
      }

      const lastBlockHeight = lastBlock
        ? lastBlock['context']['state']
        : txInfo['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 12,
  },
};

export const getTransactionInfo = async (symbol, transactionId) => {
  const apiDetails = transactionInfoAPIs[symbol];

  let txInfo = null;
  const txInfoResponse = await axios.get(
    `${apiDetails.txInfoUrl.replace('<transactionId>', transactionId)}${
      apiDetails.queryStrings
    }`,
  );
  txInfo = txInfoResponse.data;

  let lastBlock = null;
  if (apiDetails.lastBlockUrl) {
    const latestBlockResponse = await axios.get(apiDetails.lastBlockUrl);
    lastBlock = latestBlockResponse.data;
  }

  let confirmations = apiDetails.confirmationsFormula(
    transactionId,
    txInfo,
    lastBlock,
  );

  if (confirmations < 0) {
    confirmations = 0;
  }

  const confirmed = confirmations >= apiDetails.requireConfirmations;

  return {
    confirmed,
    confirmations,
    requireConfirmations: apiDetails.requireConfirmations,
  };
};

const walletTransactionsAPIs = {
  BTC: {
    dataUrl: 'https://api.blockchair.com/bitcoin/dashboards/address/<walletId>',
    queryStrings: blockchairAPIKey
      ? `?key=${blockchairAPIKey}&transaction_details=true&omni=true`
      : '?transaction_details=true&omni=true',
    extractRequireData: (walletId, data) => {
      const transactions = data['data'][walletId]['transactions'];

      const txs = [];
      for (const i in transactions) {
        const tx = transactions[i];

        txs.push({
          transactionHash: tx['hash'],
          timestamp: toTimestamp(tx['time']),
          balanceChange: tx['balance_change'] / 100000000, // Satoshi to BTC.
        });
      }

      return txs;
    },
  },
  LTC: {
    dataUrl:
      'https://api.blockchair.com/litecoin/dashboards/address/<walletId>',
    queryStrings: blockchairAPIKey
      ? `?key=${blockchairAPIKey}&transaction_details=true&omni=true`
      : '?transaction_details=true&omni=true',
    extractRequireData: (walletId, data) => {
      const transactions = data['data'][walletId]['transactions'];

      const txs = [];
      for (const i in transactions) {
        const tx = transactions[i];

        txs.push({
          transactionHash: tx['hash'],
          timestamp: toTimestamp(tx['time']),
          balanceChange: tx['balance_change'] / 100000000, // Satoshi to BTC.
        });
      }

      return txs;
    },
  },
  ETH: {},
  DOGE: {
    dataUrl:
      'https://api.blockchair.com/dogecoin/dashboards/address/<walletId>',
    queryStrings: blockchairAPIKey
      ? `?key=${blockchairAPIKey}&transaction_details=true&omni=true`
      : '?transaction_details=true&omni=true',
    extractRequireData: (walletId, data) => {
      const transactions = data['data'][walletId]['transactions'];

      const txs = [];
      for (const i in transactions) {
        const tx = transactions[i];

        txs.push({
          transactionHash: tx['hash'],
          timestamp: toTimestamp(tx['time']),
          balanceChange: tx['balance_change'] / 100000000, // Satoshi to BTC.
        });
      }

      return txs;
    },
  },
  USDT: {},
  ADA: {},
};

export const getWalletTransactions = async (symbol, walletId) => {
  const apiDetails = walletTransactionsAPIs[symbol];

  const walletResponse = await axios.get(
    `${apiDetails.dataUrl.replace('<walletId>', walletId)}${
      apiDetails.queryStrings
    }`,
  );

  return apiDetails.extractRequireData(walletId, walletResponse.data);
};
