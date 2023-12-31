import axios from 'axios';
import { blockchairAPIKey } from '../cfg.js';
import { toTimestamp, fromSatoshi, fromWei } from '../utils.js';

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

export const getTransactionInfo = async (symbol, network, transactionId) => {
  const apiDetails =
    network && transactionInfoAPIs[symbol][network]
      ? transactionInfoAPIs[symbol][network]
      : transactionInfoAPIs[symbol];

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
      for (const tx of transactions) {
        txs.push({
          transactionHash: tx['hash'],
          timestamp: toTimestamp(tx['time']),
          balanceChange: fromSatoshi(tx['balance_change']),
        });
      }

      return {
        balance: fromSatoshi(info['balance']),
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
      for (const tx of transactions) {
        txs.push({
          transactionHash: tx['hash'],
          timestamp: toTimestamp(tx['time']),
          balanceChange: fromSatoshi(tx['balance_change']),
        });
      }

      return {
        balance: fromSatoshi(info['balance']),
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
      for (const tx of transactions) {
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
          balanceChange: fromWei(balanceChange),
        });
      }

      return {
        balance: fromWei(info['balance']),
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
      for (const tx of transactions) {
        txs.push({
          transactionHash: tx['hash'],
          timestamp: toTimestamp(tx['time']),
          balanceChange: fromSatoshi(tx['balance_change']),
        });
      }

      return {
        balance: fromSatoshi(info['balance']),
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
      for (const tx of transactions) {
        const inputs = tx['ctbInputs'];
        const outputs = tx['ctbOutputs'];

        let inputAmount = 0;
        for (const input of inputs) {
          const address = input['ctaAddress'];
          if (address === walletId) {
            const amountStr = input['ctaAmount']['getCoin'];
            const amount = parseInt(amountStr, 10);
            inputAmount += amount;
          }
        }

        let outputAmount = 0;
        for (const output of outputs) {
          const address = output['ctaAddress'];
          if (address === walletId) {
            const amountStr = output['ctaAmount']['getCoin'];
            const amount = parseInt(amountStr, 10);
            outputAmount += amount;
          }
        }

        const balanceChange = outputAmount - inputAmount; // ADA

        txs.push({
          transactionHash: tx['ctbId'],
          timestamp: tx['ctbTimeIssued'], // Seconds.
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

export const getWalletInfo = async (symbol, network, walletId) => {
  const apiDetails =
    network && walletInfoAPIs[symbol][network]
      ? walletInfoAPIs[symbol][network]
      : walletInfoAPIs[symbol];

  const walletResponse = await axios.get(
    `${apiDetails.dataUrl.replace('<walletId>', walletId)}${
      apiDetails.queryStrings
    }`,
  );

  return apiDetails.extractRequireData(walletId, walletResponse.data);
};

const broadcastingAPIs = {
  BTC: {
    broadcastUrl: 'https://api.blockchair.com/bitcoin/push/transaction',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    postData: (signedTransactionHex) => {
      return `data=${signedTransactionHex}`;
    },
  },
  LTC: {
    broadcastUrl: 'https://api.blockchair.com/litecoin/push/transaction',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    postData: (signedTransactionHex) => {
      return `data=${signedTransactionHex}`;
    },
  },
  ETH: {
    broadcastUrl: 'https://api.blockchair.com/ethereum/push/transaction',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    postData: (signedTransactionHex) => {
      return `data=${signedTransactionHex}`;
    },
  },
  DOGE: {
    broadcastUrl: 'https://api.blockchair.com/dogecoin/push/transaction',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    postData: (signedTransactionHex) => {
      return `data=${signedTransactionHex}`;
    },
  },
  ADA: {
    broadcastUrl: 'https://api.blockchair.com/cardano/push/transaction',
    queryStrings: blockchairAPIKey ? `?key=${blockchairAPIKey}` : '',
    postData: (signedTransactionHex) => {
      return `data=${signedTransactionHex}`;
    },
  },
};

export const broadcastTransaction = async (
  symbol,
  network,
  signedTransactionHex,
) => {
  const apiDetails =
    network && broadcastingAPIs[symbol][network]
      ? broadcastingAPIs[symbol][network]
      : broadcastingAPIs[symbol];

  await axios.post(
    `${apiDetails.broadcastUrl}${apiDetails.queryStrings}`,
    apiDetails.postData(signedTransactionHex),
  );
};
