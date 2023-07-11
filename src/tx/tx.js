import axios from 'axios';

const transactionAPIs = {
  BTC: {
    txInfoUrl:
      'https://api.blockchair.com/bitcoin/dashboards/transaction/<transactionId>',
    lastBlockUrl: 'https://api.blockchair.com/bitcoin/stats',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['block_id'];
      const lastBlockHeight = lastBlock['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 6,
  },
  LTC: {
    txInfoUrl:
      'https://api.blockchair.com/litecoin/dashboards/transaction/<transactionId>',
    lastBlockUrl: 'https://api.blockchair.com/litecoin/stats',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['block_id'];
      const lastBlockHeight = lastBlock['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 24,
  },
  ETH: {
    txInfoUrl:
      'https://api.blockchair.com/ethereum/dashboards/transaction/<transactionId>',
    lastBlockUrl: 'https://api.blockchair.com/ethereum/stats',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['block_id'];
      const lastBlockHeight = lastBlock['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 12,
  },
  DOGE: {
    txInfoUrl:
      'https://api.blockchair.com/dogecoin/dashboards/transaction/<transactionId>',
    lastBlockUrl: 'https://api.blockchair.com/dogecoin/stats',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['block_id'];
      const lastBlockHeight = lastBlock['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 10,
  },
  USDT: {
    txInfoUrl:
      'https://api.blockchair.com/ethereum/dashboards/transaction/<transactionId>',
    lastBlockUrl: 'https://api.blockchair.com/ethereum/stats',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['block_id'];
      const lastBlockHeight = lastBlock['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 12,
  },
  USDC: {
    txInfoUrl:
      'https://api.blockchair.com/ethereum/dashboards/transaction/<transactionId>',
    lastBlockUrl: 'https://api.blockchair.com/ethereum/stats',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['block_id'];
      const lastBlockHeight = lastBlock['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 12,
  },
  ADA: {
    txInfoUrl:
      'https://api.blockchair.com/cardano/raw/transaction/<transactionId>',
    lastBlockUrl: 'https://api.blockchair.com/cardano/stats',
    confirmationsFormula: (transactionId, txInfo, lastBlock) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['ctsBlockHeight'];
      const lastBlockHeight = lastBlock['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
    requireConfirmations: 12,
  },
  SOL: {
    // Too many request issue.
    txInfoUrl: 'https://api.solscan.io/transaction?tx=<transactionId>',
    lastBlockUrl: null,
    confirmationsFormula: (transactionId, txInfo) => {
      return (txInfo.slot * 60 * 60) / 2000;
    },
    requireConfirmations: 2,
  },
};

export const getTransactionInfo = async (symbol, transactionId) => {
  const apiDetails = transactionAPIs[symbol];

  let txInfo = null;
  const txInfoResponse = await axios.get(
    apiDetails.txInfoUrl.replace('<transactionId>', transactionId),
  );
  txInfo = txInfoResponse.data;

  let lastBlock = null;
  if (apiDetails.lastBlockUrl) {
    const latestBlockResponse = await axios.get(apiDetails.lastBlockUrl);
    lastBlock = latestBlockResponse.data;
  }

  let confirmations = null;
  if (lastBlock) {
    confirmations = apiDetails.confirmationsFormula(
      transactionId,
      txInfo,
      lastBlock,
    );
  } else {
    confirmations = apiDetails.confirmationsFormula(transactionId, txInfo);
  }

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
