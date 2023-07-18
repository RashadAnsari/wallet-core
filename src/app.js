import express from 'express';
import healthRouter from './routes/health.js';
import cryptoRouter from './routes/crypto.js';
import { initWasm } from '@trustwallet/wallet-core';

const app = express();

app.use(express.json());
app.use('/', healthRouter);
app.use('/', cryptoRouter);

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  let statusCode = 500;
  let errorMessages = ['Internal Server Error'];

  if (err.isAxiosError && err.response) {
    statusCode = err.response.status;
    errorMessages = [err.response.statusText];
  } else {
    statusCode = err.statusCode || statusCode;
    errorMessages =
      err.messages || (err.message ? [err.message] : errorMessages);
  }

  res.status(statusCode).json({ errors: errorMessages });
}

app.use(errorHandler);

export default async function () {
  app.locals.core = await initWasm(); // Initialize WebAssembly.
  return app;
}
