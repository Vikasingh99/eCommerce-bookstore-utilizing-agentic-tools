'use strict';

const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.use(authenticate);

// GET /api/orders — list all orders for the authenticated user
router.get('/', orderController.getOrders);

// POST /api/orders
router.post('/', orderController.createOrder);

// GET /api/orders/:id
router.get('/:id', orderController.getOrder);

module.exports = router;
