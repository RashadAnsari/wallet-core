const express = require('express');
const router = express.Router();
const joi = require('joi');

const getTransactionUrlSchema = joi.object({
  coin_type: joi.number().min(0).required(),
  transaction_hash: joi.string().min(0).required(),
});

router.get('/v1/transaction/url', async function (req, res, next) {
  const { error } = getTransactionUrlSchema.validate(req.query);
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  /** @type {import('@trustwallet/wallet-core').WalletCore} */
  const core = req.app.locals.core;
  const { CoinTypeConfiguration } = core;
  const { coin_type, transaction_hash } = req.query;

  try {
    const coinType = { value: coin_type };
    const url = CoinTypeConfiguration.getTransactionURL(
      coinType,
      transaction_hash,
    );

    const response = { url: url };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
