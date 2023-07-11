import joi from 'joi';
import { Router } from 'express';
import { toHexString } from '../utils.js';
import { supportedSymbols, mnemonic, passphrase, getChainId } from '../cfg.js';

const router = Router();

const hdwalletPostSchema = joi.object({
  symbol: joi
    .string()
    .valid(...supportedSymbols)
    .required(),
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
    const coinType = { value: getChainId(symbol) };
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

export default router;
