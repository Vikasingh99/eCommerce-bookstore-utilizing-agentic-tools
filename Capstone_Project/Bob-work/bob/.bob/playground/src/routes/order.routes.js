'use strict';

const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.use(authenticate);

// POST /api/orders
router.post('/', orderController.createOrder);

// GET /api/orders/:id
router.get('/:id', orderController.getOrder);

module.exports = router;
