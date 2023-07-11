import express from 'express';
import healthRouter from './routes/health.js';
import transactionRouter from './routes/tx.js';
import hdwalletRouter from './routes/hdwallet.js';
import { initWasm } from '@trustwallet/wallet-core';

const app = express();

app.use(express.json());
app.use('/', healthRouter);
app.use('/', hdwalletRouter);
app.use('/', transactionRouter);

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const errorMessages = err.message || 'Internal Server Error';
  res.status(statusCode).json({ errors: [errorMessages] });
}

app.use(errorHandler);

export default async function () {
  app.locals.core = await initWasm(); // Initialize WebAssembly.
  return app;
}
