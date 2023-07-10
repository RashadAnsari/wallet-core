const express = require('express');
const router = express.Router();

router.get('/health', function (req, res) {
  res.status(204).end();
});

module.exports = router;
