const express = require('express');
const healthRouter = require('./routes/health');
const hdwalletRouter = require('./routes/hdwallet');
const transactionRouter = require('./routes/transaction');
const { initWasm } = require('@trustwallet/wallet-core');

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

module.exports = async function () {
  app.locals.core = await initWasm(); // Initialize WebAssembly.
  return app;
};
