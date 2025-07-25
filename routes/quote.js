const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');

router.post('/shipping-quote', quoteController.createQuote);

module.exports = router;