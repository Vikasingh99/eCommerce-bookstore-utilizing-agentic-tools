'use strict';

const { Router } = require('express');
const cartController = require('../controllers/cart.controller');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.use(authenticate);

// GET /api/cart
router.get('/', cartController.getCart);

// POST /api/cart/items
router.post('/items', cartController.addToCart);

// PUT /api/cart/items/:productId
router.put('/items/:productId', cartController.updateCartItem);

// DELETE /api/cart/items/:productId
router.delete('/items/:productId', cartController.removeFromCart);

module.exports = router;
