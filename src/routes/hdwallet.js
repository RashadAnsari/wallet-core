const express = require('express');
const router = express.Router();
const cfg = require('../cfg');
const { toHexString } = require('../utils');
const joi = require('joi');

const hdwalletPostSchema = joi.object({
  coin_type: joi.number().min(0).required(),
  account_index: joi.number().min(0).required(),
  external_chain: joi.number().min(0).required(),
  address_index: joi.number().min(0).required(),
});

router.post('/v1/hdwallet', async function (req, res, next) {
  const { error } = hdwalletPostSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  /** @type {import('@trustwallet/wallet-core').WalletCore} */
  const { HDWallet, AnyAddress } = req.app.locals.core;
  const { coin_type, account_index, external_chain, address_index } = req.body;

  try {
    const hdwallet = HDWallet.createWithMnemonic(cfg.mnemonic, cfg.passphrase);
    const coinType = { value: coin_type };
    const privateKey = hdwallet.getDerivedKey(
      coinType,
      account_index,
      external_chain,
      address_index,
    );
    const publicKey = privateKey.getPublicKey(coinType);
    const privateKeyHex = toHexString(privateKey.data());
    const address = AnyAddress.createWithPublicKey(publicKey, coinType);

    const response = {
      address: address.description(),
      public_key: publicKey.description(),
      private_key: privateKeyHex,
    };

    address.delete();
    publicKey.delete();
    privateKey.delete();
    hdwallet.delete();

    res.json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
