import joi from 'joi';
import { Router } from 'express';
import { toHexString } from '../utils.js';
import { symbolValidator, mnemonic, passphrase, getChainId } from '../cfg.js';
import { getTransactionInfo, getWalletInfo } from '../crypto/crypto.js';

const router = Router();

const hdwalletPostSchema = joi.object({
  symbol: joi.string().custom(symbolValidator).required(),
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
  const { symbol, accountIndex, externalChain, addressIndex } = value;

  try {
    const hdwallet = HDWallet.createWithMnemonic(mnemonic, passphrase);
    const chainId = getChainId(symbol);
    const coinType = { value: chainId };
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
  transactionId: joi.string().required(),
});

router.get('/v1/:symbol/transaction/:transactionId', async (req, res, next) => {
  const { value, error } = getTransactionSchema.validate(req.params);
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  /** @type {import('@trustwallet/wallet-core').WalletCore} */
  const core = req.app.locals.core;
  const { CoinTypeConfiguration } = core;
  const { symbol, transactionId } = value;

  try {
    const chainId = getChainId(symbol);
    const coinType = { value: chainId };
    const url = CoinTypeConfiguration.getTransactionURL(
      coinType,
      transactionId,
    );
    const info = await getTransactionInfo(symbol, transactionId);

    const response = { ...info, url };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

const getWalletTransactionsSchema = joi.object({
  symbol: joi.string().custom(symbolValidator).required(),
  walletId: joi.string().required(),
});

router.get('/v1/:symbol/wallet/:walletId', async (req, res, next) => {
  const { value, error } = getWalletTransactionsSchema.validate(req.params);
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  const { symbol, walletId } = value;

  try {
    const response = await getWalletInfo(symbol, walletId);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
