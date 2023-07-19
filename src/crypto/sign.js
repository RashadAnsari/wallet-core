import joi from 'joi';
import { TW } from '@trustwallet/wallet-core';
import { toHexString, apiError, toSatoshi } from '../utils.js';

const signingErrors = {
  1: 'General signing error',
  2: 'Internal signing error',
  3: 'Low balance error',
  4: 'Zero amount requested error',
  5: 'Missing private key error',
  15: 'Invalid private key error',
  16: 'Invalid address error',
  17: 'Invalid utxo error',
  18: 'Invalid utxo amount error',
  6: 'Wrong fee error',
  7: 'Signing error',
  8: 'Transaction too big error',
  9: 'Missing input utxos error',
  10: 'Not enough utxos error',
  11: 'Script redeem error',
  12: 'Script output error',
  13: 'Script witness program error',
  14: 'Invalid memo error',
  19: 'Input parse error',
  20: 'No support n2n error',
  21: 'Signatures count error',
  22: 'Invalid params error',
  23: 'Invalid requested token amount error',
};

const transactionSigners = {
  BTC: {
    validator: joi.object({
      inputs: joi
        .array()
        .items(
          joi.object({
            hash: joi.string().hex().required(),
            index: joi.number().min(0).default(0),
            amount: joi.number().greater(0).required(),
            address: joi.string().required(),
            privateKey: joi.string().hex().required(),
          }),
        )
        .min(1),
      outputs: joi
        .array()
        .items({
          amount: joi.number().greater(0).required(),
          address: joi.string().required(),
        })
        .length(1), // FIXME: Add support for multiple outputs.
      // .min(1),
      changeAddress: joi.string().required(),
    }),
    sign: (data, walletCore) => {
      /** @type {import('@trustwallet/wallet-core').WalletCore} */
      const { HexCoding, BitcoinScript, CoinType, AnySigner } = walletCore;

      const { inputs, outputs, changeAddress } = data;

      const privateKeys = [];
      const unspentTransactions = [];
      for (const input of inputs) {
        unspentTransactions.push(
          TW.Bitcoin.Proto.UnspentTransaction.create({
            outPoint: TW.Bitcoin.Proto.OutPoint.create({
              hash: HexCoding.decode(input.hash).reverse(),
              index: input.index,
            }),
            amount: toSatoshi(input.amount),
            script: BitcoinScript.lockScriptForAddress(
              input.address,
              CoinType.bitcoin,
            ).data(),
          }),
        );

        privateKeys.push(HexCoding.decode(input.privateKey));
      }

      const signingInput = TW.Bitcoin.Proto.SigningInput.create({
        hashType: BitcoinScript.hashTypeForCoin(CoinType.bitcoin),
        byteFee: 5, // Recomended by https://blockchair.com/bitcoin
        useMaxUtxo: true, // Use all utxos amounts.
        amount: toSatoshi(outputs[0].amount),
        toAddress: outputs[0].address,
        changeAddress: changeAddress,
        privateKey: privateKeys,
        utxo: unspentTransactions,
        coinType: CoinType.dogecoin.value,
      });

      const encoded =
        TW.Bitcoin.Proto.SigningInput.encode(signingInput).finish();
      const outputData = AnySigner.sign(encoded, CoinType.bitcoin);
      const output = TW.Bitcoin.Proto.SigningOutput.decode(outputData);

      if (output.error !== 0) {
        throw apiError([signingErrors[output.error]], 400);
      }

      return {
        transactionId: output.transactionId,
        signedTransactionHex: toHexString(output.encoded),
      };
    },
  },
  LTC: {
    validator: joi.object({
      inputs: joi
        .array()
        .items(
          joi.object({
            hash: joi.string().hex().required(),
            index: joi.number().min(0).default(0),
            amount: joi.number().greater(0).required(),
            address: joi.string().required(),
            privateKey: joi.string().hex().required(),
          }),
        )
        .min(1),
      outputs: joi
        .array()
        .items({
          amount: joi.number().greater(0).required(),
          address: joi.string().required(),
        })
        .length(1), // FIXME: Add support for multiple outputs.
      // .min(1),
      changeAddress: joi.string().required(),
    }),
    sign: (data, walletCore) => {
      /** @type {import('@trustwallet/wallet-core').WalletCore} */
      const { HexCoding, BitcoinScript, CoinType, AnySigner } = walletCore;

      const { inputs, outputs, changeAddress } = data;

      const privateKeys = [];
      const unspentTransactions = [];
      for (const input of inputs) {
        unspentTransactions.push(
          TW.Bitcoin.Proto.UnspentTransaction.create({
            outPoint: TW.Bitcoin.Proto.OutPoint.create({
              hash: HexCoding.decode(input.hash).reverse(),
              index: input.index,
            }),
            amount: toSatoshi(input.amount),
            script: BitcoinScript.lockScriptForAddress(
              input.address,
              CoinType.litecoin,
            ).data(),
          }),
        );

        privateKeys.push(HexCoding.decode(input.privateKey));
      }

      const signingInput = TW.Bitcoin.Proto.SigningInput.create({
        hashType: BitcoinScript.hashTypeForCoin(CoinType.litecoin),
        byteFee: 1, // Recomended by https://blockchair.com/litecoin
        useMaxUtxo: true, // Use all utxos amounts.
        amount: toSatoshi(outputs[0].amount),
        toAddress: outputs[0].address,
        changeAddress: changeAddress,
        privateKey: privateKeys,
        utxo: unspentTransactions,
        coinType: CoinType.dogecoin.value,
      });

      const encoded =
        TW.Bitcoin.Proto.SigningInput.encode(signingInput).finish();
      const outputData = AnySigner.sign(encoded, CoinType.litecoin);
      const output = TW.Bitcoin.Proto.SigningOutput.decode(outputData);

      if (output.error !== 0) {
        throw apiError([signingErrors[output.error]], 400);
      }

      return {
        transactionId: output.transactionId,
        signedTransactionHex: toHexString(output.encoded),
      };
    },
  },
  DOGE: {
    validator: joi.object({
      inputs: joi
        .array()
        .items(
          joi.object({
            hash: joi.string().hex().required(),
            index: joi.number().min(0).default(0),
            amount: joi.number().greater(0).required(),
            address: joi.string().required(),
            privateKey: joi.string().hex().required(),
          }),
        )
        .min(1),
      outputs: joi
        .array()
        .items({
          amount: joi.number().greater(0).required(),
          address: joi.string().required(),
        })
        .length(1), // FIXME: Add support for multiple outputs.
      // .min(1),
      changeAddress: joi.string().required(),
    }),
    sign: (data, walletCore) => {
      /** @type {import('@trustwallet/wallet-core').WalletCore} */
      const { HexCoding, BitcoinScript, CoinType, AnySigner } = walletCore;

      const { inputs, outputs, changeAddress } = data;

      const privateKeys = [];
      const unspentTransactions = [];
      for (const input of inputs) {
        unspentTransactions.push(
          TW.Bitcoin.Proto.UnspentTransaction.create({
            outPoint: TW.Bitcoin.Proto.OutPoint.create({
              hash: HexCoding.decode(input.hash).reverse(),
              index: input.index,
            }),
            amount: toSatoshi(input.amount),
            script: BitcoinScript.lockScriptForAddress(
              input.address,
              CoinType.dogecoin,
            ).data(),
          }),
        );

        privateKeys.push(HexCoding.decode(input.privateKey));
      }

      const signingInput = TW.Bitcoin.Proto.SigningInput.create({
        hashType: BitcoinScript.hashTypeForCoin(CoinType.dogecoin),
        byteFee: 500000, // Recomended by https://blockchair.com/dogecoin
        useMaxUtxo: true, // Use all utxos amounts.
        amount: toSatoshi(outputs[0].amount),
        toAddress: outputs[0].address,
        changeAddress: changeAddress,
        privateKey: privateKeys,
        utxo: unspentTransactions,
        coinType: CoinType.dogecoin.value,
      });

      const encoded =
        TW.Bitcoin.Proto.SigningInput.encode(signingInput).finish();
      const outputData = AnySigner.sign(encoded, CoinType.dogecoin);
      const output = TW.Bitcoin.Proto.SigningOutput.decode(outputData);

      if (output.error !== 0) {
        throw apiError([signingErrors[output.error]], 400);
      }

      return {
        transactionId: output.transactionId,
        signedTransactionHex: toHexString(output.encoded),
      };
    },
  },
};

export const signTransaction = (symbol, network, data, walletCore) => {
  const signer =
    network && transactionSigners[symbol][network]
      ? transactionSigners[symbol][network]
      : transactionSigners[symbol];

  const { value, error } = signer.validator.validate(data);
  if (error) {
    throw apiError(
      error.details.map((detail) => detail.message),
      400,
    );
  }

  return signer.sign(value, walletCore);
};
