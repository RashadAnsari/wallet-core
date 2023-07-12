import joi from 'joi';
import { Router } from 'express';
import { getTransactionInfo } from '../crypto/tx.js';
import { supportedSymbols, getChainId } from '../cfg.js';

const router = Router();

const getTransactionSchema = joi.object({
  symbol: joi
    .string()
    .valid(...supportedSymbols)
    .required(),
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
    const coinType = { value: getChainId(symbol) };
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

export default router;
