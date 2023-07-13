import joi from 'joi';
import { Router } from 'express';
import { getTransactionInfo, getWalletTransactions } from '../crypto/tx.js';
import { symbolValidator, getChainId } from '../cfg.js';

const router = Router();

const getTransactionSchema = joi.object({
  symbol: joi.string().custom(symbolValidator).required(),
  transactionId: joi.string().required(),
});

router.get('/v1/transaction', async (req, res, next) => {
  const { value, error } = getTransactionSchema.validate(req.query);
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
    const info = await getTransactionInfo(symbol, chainId, transactionId);

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

router.get('/v1/wallet/transactions', async (req, res, next) => {
  const { value, error } = getWalletTransactionsSchema.validate(req.query);
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  const { symbol, walletId } = value;

  try {
    const chainId = getChainId(symbol);
    const response = await getWalletTransactions(symbol, chainId, walletId);

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
