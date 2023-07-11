import axios from 'axios';

const transactionAPIs = {
  BTC: {
    transactionInfo:
      'https://api.blockchair.com/bitcoin/dashboards/transaction/<transactionId>',
    transactionBlockHeight: 'data.<transactionId>.transaction.block_id',
    latestBlock: 'https://api.blockchair.com/bitcoin/stats',
    latestBlockHeight: 'context.state',
    requireConfirmations: 6,
  },
  LTC: {
    transactionInfo:
      'https://api.blockchair.com/litecoin/dashboards/transaction/<transactionId>',
    transactionBlockHeight: 'data.<transactionId>.transaction.block_id',
    latestBlock: 'https://api.blockchair.com/litecoin/stats',
    latestBlockHeight: 'context.state',
    requireConfirmations: 24,
  },
  ETH: {
    transactionInfo:
      'https://api.blockchair.com/ethereum/dashboards/transaction/<transactionId>',
    transactionBlockHeight: 'data.<transactionId>.transaction.block_id',
    latestBlock: 'https://api.blockchair.com/ethereum/stats',
    latestBlockHeight: 'context.state',
    requireConfirmations: 6,
  },
  DOGE: {
    transactionInfo:
      'https://api.blockchair.com/dogecoin/dashboards/transaction/<transactionId>',
    transactionBlockHeight: 'data.<transactionId>.transaction.block_id',
    latestBlock: 'https://api.blockchair.com/dogecoin/stats',
    latestBlockHeight: 'context.state',
    requireConfirmations: 15,
  },
  USDT: {
    transactionInfo:
      'https://api.blockchair.com/ethereum/dashboards/transaction/<transactionId>',
    transactionBlockHeight: 'data.<transactionId>.transaction.block_id',
    latestBlock: 'https://api.blockchair.com/ethereum/stats',
    latestBlockHeight: 'context.state',
    requireConfirmations: 6,
  },
  USDC: {
    transactionInfo:
      'https://api.blockchair.com/ethereum/dashboards/transaction/<transactionId>',
    transactionBlockHeight: 'data.<transactionId>.transaction.block_id',
    latestBlock: 'https://api.blockchair.com/ethereum/stats',
    latestBlockHeight: 'context.state',
    requireConfirmations: 6,
  },
  ADA: {
    transactionInfo:
      'https://api.blockchair.com/cardano/raw/transaction/<transactionId>',
    transactionBlockHeight: 'data.<transactionId>.transaction.ctsBlockHeight',
    latestBlock: 'https://api.blockchair.com/cardano/stats',
    latestBlockHeight: 'context.state',
    requireConfirmations: 6,
  },
  SOL: {},
};

const getObjectKey = (object, key) => {
  const keys = key.split('.');

  let currentObject = object;

  for (let i = 0; i < keys.length; i++) {
    currentObject = currentObject[keys[i]];
    if (currentObject === undefined) {
      return undefined;
    }
  }

  return currentObject;
};

export const getTransactionInfo = async (symbol, transactionId) => {
  const apiDetails = transactionAPIs[symbol];

  const transactionResponse = await axios.get(
    apiDetails.transactionInfo.replace('<transactionId>', transactionId),
  );
  const transactionData = transactionResponse.data;

  const latestBlockResponse = await axios.get(apiDetails.latestBlock);
  const latestBlockData = latestBlockResponse.data;

  const transactionBlockHeightKey = apiDetails.transactionBlockHeight.replace(
    '<transactionId>',
    transactionId,
  );

  const transactionHeight = getObjectKey(
    transactionData,
    transactionBlockHeightKey,
  );
  const latestBlockHeight = getObjectKey(
    latestBlockData,
    apiDetails.latestBlockHeight,
  );

  let confirmations = latestBlockHeight - transactionHeight + 1;
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
