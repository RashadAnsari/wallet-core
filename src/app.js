var express = require('express');
var healthRouter = require('./routes/health');

var app = express();
app.use(express.json());
app.use('/', healthRouter);

module.exports = app;
