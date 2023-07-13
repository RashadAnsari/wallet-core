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

  let statusCode = 500;
  let errorMessage = 'Internal Server Error';

  if (err.isAxiosError && err.response) {
    statusCode = err.response.status;
    errorMessage = err.response.statusText;
  } else {
    statusCode = err.statusCode || statusCode;
    errorMessage = err.message || errorMessage;
  }

  res.status(statusCode).json({ errors: [errorMessage] });
}

app.use(errorHandler);

export default async function () {
  app.locals.core = await initWasm(); // Initialize WebAssembly.
  return app;
}
