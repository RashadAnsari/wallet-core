var express = require('express');
var router = express.Router();

router.get('/health', function (req, res) {
  res.status(204).end();
});

module.exports = router;
