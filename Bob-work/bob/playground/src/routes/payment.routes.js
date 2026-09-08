'use strict';

const { Router } = require('express');
const paymentController = require('../controllers/payment.controller');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.use(authenticate);

// POST /api/payments
router.post('/', paymentController.processPayment);

module.exports = router;
