import axios from 'axios';
import { blockchairAPIKey } from '../cfg.js';
import { toTimestamp } from '../utils.js';

const transactionInfoAPIs = {
  BTC: {
    txInfoUrl:
      'https://api.blockchair.com/bitcoin/dashboards/transaction/<transactionId>',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    requireConfirmations: 6,
    calculateConfirmations: (transactionId, txInfo) => {
      const txId = transactionId.toLowerCase();
      const blockHeight = txInfo['data'][txId]['transaction']['block_id'];
      if (blockHeight === -1) {
        return 0;
      }

      const lastBlockHeight = txInfo['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
  },
  LTC: {
    txInfoUrl:
      'https://api.blockchair.com/litecoin/dashboards/transaction/<transactionId>',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    requireConfirmations: 24,
    calculateConfirmations: (transactionId, txInfo) => {
      const txId = transactionId.toLowerCase();
      const blockHeight = txInfo['data'][txId]['transaction']['block_id'];
      if (blockHeight === -1) {
        return 0;
      }

      const lastBlockHeight = txInfo['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
  },
  ETH: {
    txInfoUrl:
      'https://api.blockchair.com/ethereum/dashboards/transaction/<transactionId>',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    requireConfirmations: 12,
    calculateConfirmations: (transactionId, txInfo) => {
      const txId = transactionId.toLowerCase();
      const blockHeight = txInfo['data'][txId]['transaction']['block_id'];
      if (blockHeight === -1) {
        return 0;
      }

      const lastBlockHeight = txInfo['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
  },
  DOGE: {
    txInfoUrl:
      'https://api.blockchair.com/dogecoin/dashboards/transaction/<transactionId>',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    requireConfirmations: 10,
    calculateConfirmations: (transactionId, txInfo) => {
      const txId = transactionId.toLowerCase();
      const blockHeight = txInfo['data'][txId]['transaction']['block_id'];
      if (blockHeight === -1) {
        return 0;
      }

      const lastBlockHeight = txInfo['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
  },
  ADA: {
    txInfoUrl:
      'https://api.blockchair.com/cardano/raw/transaction/<transactionId>',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    requireConfirmations: 12,
    calculateConfirmations: (transactionId, txInfo) => {
      const blockHeight =
        txInfo['data'][transactionId]['transaction']['ctsBlockHeight'];
      if (blockHeight === -1) {
        return 0;
      }

      const lastBlockHeight = txInfo['context']['state'];

      return lastBlockHeight - blockHeight + 1;
    },
  },
};

export const getTransactionInfo = async (symbol, transactionId) => {
  const apiDetails = transactionInfoAPIs[symbol];

  const txInfoResponse = await axios.get(
    `${apiDetails.txInfoUrl.replace('<transactionId>', transactionId)}${
      apiDetails.queryStrings
    }`,
  );

  let confirmations = apiDetails.calculateConfirmations(
    transactionId,
    txInfoResponse.data,
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

const walletInfoAPIs = {
  BTC: {
    dataUrl: 'https://api.blockchair.com/bitcoin/dashboards/address/<walletId>',
    queryStrings: blockchairAPIKey
      ? `?key=${blockchairAPIKey}&transaction_details=true&omni=true&limit=10`
      : '?transaction_details=true&omni=true&limit=10',
    extractRequireData: (walletId, data) => {
      const info = data['data'][walletId]['address'];
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

      return {
        balance: info['balance'] / 100000000, // Satoshi to BTC.
        transactions: txs,
      };
    },
  },
  LTC: {
    dataUrl:
      'https://api.blockchair.com/litecoin/dashboards/address/<walletId>',
    queryStrings: blockchairAPIKey
      ? `?key=${blockchairAPIKey}&transaction_details=true&omni=true&limit=10`
      : '?transaction_details=true&omni=true&limit=10',
    extractRequireData: (walletId, data) => {
      const info = data['data'][walletId]['address'];
      const transactions = data['data'][walletId]['transactions'];

      const txs = [];
      for (const i in transactions) {
        const tx = transactions[i];

        txs.push({
          transactionHash: tx['hash'],
          timestamp: toTimestamp(tx['time']),
          balanceChange: tx['balance_change'] / 100000000, // Satoshi to LTC.
        });
      }

      return {
        balance: info['balance'] / 100000000, // Satoshi to LTC.
        transactions: txs,
      };
    },
  },
  ETH: {
    dataUrl:
      'https://api.blockchair.com/ethereum/dashboards/address/<walletId>',
    queryStrings: blockchairAPIKey
      ? `?key=${blockchairAPIKey}&transaction_details=true&limit=10`
      : '?transaction_details=true&limit=10',
    extractRequireData: (walletId, data) => {
      const wallId = walletId.toLowerCase();
      const info = data['data'][wallId]['address'];
      const transactions = data['data'][wallId]['calls'];

      const txs = [];
      for (const i in transactions) {
        const tx = transactions[i];

        let balanceChange = tx['value'];
        if (tx['sender'] === walletId) {
          balanceChange = -balanceChange;
        }

        if (balanceChange === 0) {
          continue; // 0 balance change is not an ETH transaction.
        }

        txs.push({
          transactionHash: tx['transaction_hash'],
          timestamp: toTimestamp(tx['time']),
          balanceChange: balanceChange / 1000000000000000000, // Wei to ETH.
        });
      }

      return {
        balance: info['balance'] / 1000000000000000000, // Wei to ETH.,
        transactions: txs,
      };
    },
  },
  DOGE: {
    dataUrl:
      'https://api.blockchair.com/dogecoin/dashboards/address/<walletId>',
    queryStrings: blockchairAPIKey
      ? `?key=${blockchairAPIKey}&transaction_details=true&omni=true&limit=10`
      : '?transaction_details=true&omni=true&limit=10',
    extractRequireData: (walletId, data) => {
      const info = data['data'][walletId]['address'];
      const transactions = data['data'][walletId]['transactions'];

      const txs = [];
      for (const i in transactions) {
        const tx = transactions[i];

        txs.push({
          transactionHash: tx['hash'],
          timestamp: toTimestamp(tx['time']),
          balanceChange: tx['balance_change'] / 100000000, // Satoshi to DOGE.
        });
      }

      return {
        balance: info['balance'] / 100000000, // Satoshi to DOGE.
        transactions: txs,
      };
    },
  },
  ADA: {
    dataUrl: 'https://api.blockchair.com/cardano/raw/address/<walletId>',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    extractRequireData: (walletId, data) => {
      const info = data['data'][walletId]['address'];
      const transactions = info['caTxList'];

      const txs = [];
      for (const i in transactions) {
        const tx = transactions[i];
        const inputs = tx['ctbInputs'];
        const outputs = tx['ctbOutputs'];

        let inputAmount = 0;
        for (const j in inputs) {
          const address = inputs[j]['ctaAddress'];
          if (address === walletId) {
            const amountStr = inputs[j]['ctaAmount']['getCoin'];
            const amount = parseInt(amountStr, 10);
            inputAmount += amount;
          }
        }

        let outputAmount = 0;
        for (const j in outputs) {
          const address = outputs[j]['ctaAddress'];
          if (address === walletId) {
            const amountStr = outputs[j]['ctaAmount']['getCoin'];
            const amount = parseInt(amountStr, 10);
            outputAmount += amount;
          }
        }

        const balanceChange = outputAmount - inputAmount; // ADA

        txs.push({
          transactionHash: tx['ctbId'],
          timestamp: tx['ctbTimeIssued'], // seconds.
          balanceChange: balanceChange,
        });
      }

      return {
        balance: parseInt(info['caBalance']['getCoin'], 10), // ADA
        transactions: txs,
      };
    },
  },
};

export const getWalletInfo = async (symbol, walletId) => {
  const apiDetails = walletInfoAPIs[symbol];

  const walletResponse = await axios.get(
    `${apiDetails.dataUrl.replace('<walletId>', walletId)}${
      apiDetails.queryStrings
    }`,
  );

  return apiDetails.extractRequireData(walletId, walletResponse.data);
};
