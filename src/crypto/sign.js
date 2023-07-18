import joi from 'joi';
import { TW } from '@trustwallet/wallet-core';
import { toHexString, apiError } from '../utils.js';

const transactionSigners = {
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
        .min(1),
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
            amount: Math.round(input.amount * 100000000), // DOGE to Satoshi.
            script: BitcoinScript.lockScriptForAddress(
              input.address,
              CoinType.dogecoin,
            ).data(),
          }),
        );

        privateKeys.push(HexCoding.decode(input.privateKey));
      }

      const extraOutputs = [];
      for (const i in outputs) {
        if (i == 0) {
          continue;
        }

        extraOutputs.push(
          TW.Bitcoin.Proto.OutputAddress.create({
            amount: Math.floor(outputs[i].amount * 100000000), // DOGE to Satoshi.
            toAddress: outputs[i].address,
          }),
        );
      }

      const signingInput = TW.Bitcoin.Proto.SigningInput.create({
        hashType: BitcoinScript.hashTypeForCoin(CoinType.dogecoin),
        byteFee: 5000,
        amount: Math.floor(outputs[0].amount * 100000000), // DOGE to Satoshi.
        toAddress: outputs[0].address,
        changeAddress: changeAddress,
        privateKey: privateKeys,
        utxo: unspentTransactions,
        extraOutputs: extraOutputs,
        coinType: CoinType.dogecoin.value,
      });

      const encoded =
        TW.Bitcoin.Proto.SigningInput.encode(signingInput).finish();
      const outputData = AnySigner.sign(encoded, CoinType.dogecoin);
      const output = TW.Bitcoin.Proto.SigningOutput.decode(outputData);

      return {
        errorCode: output.error, // 0 for success.
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
