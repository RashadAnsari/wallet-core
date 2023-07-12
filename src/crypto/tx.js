import axios from 'axios';
import { blockchairAPIKey } from '../cfg.js';

const transactionAPIs = {
  BTC: {
    txInfoUrl:
      'https://api.blockchair.com/bitcoin/dashboards/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/bitcoin/stats',
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
    queryStrings: `?key=${blockchairAPIKey}` ? blockchairAPIKey : '',
  },
  LTC: {
    txInfoUrl:
      'https://api.blockchair.com/litecoin/dashboards/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/litecoin/stats',
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
    queryStrings: `?key=${blockchairAPIKey}` ? blockchairAPIKey : '',
  },
  ETH: {
    txInfoUrl:
      'https://api.blockchair.com/ethereum/dashboards/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/ethereum/stats',
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
    queryStrings: `?key=${blockchairAPIKey}` ? blockchairAPIKey : '',
  },
  DOGE: {
    txInfoUrl:
      'https://api.blockchair.com/dogecoin/dashboards/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/dogecoin/stats',
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
    queryStrings: `?key=${blockchairAPIKey}` ? blockchairAPIKey : '',
  },
  USDT: {
    txInfoUrl:
      'https://api.blockchair.com/ethereum/dashboards/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/ethereum/stats',
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
    queryStrings: `?key=${blockchairAPIKey}` ? blockchairAPIKey : '',
  },
  ADA: {
    txInfoUrl:
      'https://api.blockchair.com/cardano/raw/transaction/<transactionId>',
    lastBlockUrl: null,
    // lastBlockUrl: 'https://api.blockchair.com/cardano/stats',
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
    queryStrings: `?key=${blockchairAPIKey}` ? blockchairAPIKey : '',
  },
};

export const getTransactionInfo = async (symbol, transactionId) => {
  const apiDetails = transactionAPIs[symbol];

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
