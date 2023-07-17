import joi from 'joi';
import { Router } from 'express';
import { mnemonic, passphrase } from '../cfg.js';
import { getTransactionInfo, getWalletInfo } from '../crypto/crypto.js';
import {
  symbolValidator,
  networkValidator,
  getCoinType,
  toHexString,
} from '../utils.js';

const router = Router();

const hdwalletPostSchema = joi.object({
  symbol: joi.string().custom(symbolValidator).required(),
  network: joi.string().custom(networkValidator),
  accountIndex: joi.number().min(0).default(0),
  externalChain: joi.number().min(0).default(0),
  addressIndex: joi.number().min(0).default(0),
});

router.post('/v1/hdwallet', async (req, res, next) => {
  const { value, error } = hdwalletPostSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  /** @type {import('@trustwallet/wallet-core').WalletCore} */
  const { HDWallet, AnyAddress } = req.app.locals.core;
  const { symbol, network, accountIndex, externalChain, addressIndex } = value;

  try {
    const hdwallet = HDWallet.createWithMnemonic(mnemonic, passphrase);
    const coinType = getCoinType(symbol, network, req.app.locals.core);
    const privateKey = hdwallet.getDerivedKey(
      coinType,
      accountIndex,
      externalChain,
      addressIndex,
    );
    const publicKey = privateKey.getPublicKey(coinType);
    const privateKeyHex = toHexString(privateKey.data());
    const address = AnyAddress.createWithPublicKey(publicKey, coinType);

    const response = {
      address: address.description(),
      publicKey: publicKey.description(),
      privateKey: privateKeyHex,
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

const getTransactionSchema = joi.object({
  symbol: joi.string().custom(symbolValidator).required(),
  network: joi.string().custom(networkValidator),
  transactionId: joi.string().required(),
});

router.get('/v1/:symbol/transaction/:transactionId', async (req, res, next) => {
  const { value, error } = getTransactionSchema.validate({
    ...req.params,
    ...req.query,
  });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  /** @type {import('@trustwallet/wallet-core').WalletCore} */
  const core = req.app.locals.core;
  const { CoinTypeConfiguration } = core;
  const { symbol, network, transactionId } = value;

  try {
    const coinType = getCoinType(symbol, network, req.app.locals.core);
    const url = CoinTypeConfiguration.getTransactionURL(
      coinType,
      transactionId,
    );
    const info = await getTransactionInfo(symbol, network, transactionId);

    const response = { ...info, url };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

const getWalletTransactionsSchema = joi.object({
  symbol: joi.string().custom(symbolValidator).required(),
  network: joi.string().custom(networkValidator),
  walletId: joi.string().required(),
});

router.get('/v1/:symbol/wallet/:walletId', async (req, res, next) => {
  const { value, error } = getWalletTransactionsSchema.validate({
    ...req.params,
    ...req.query,
  });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  const { symbol, network, walletId } = value;

  try {
    const response = await getWalletInfo(symbol, network, walletId);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
