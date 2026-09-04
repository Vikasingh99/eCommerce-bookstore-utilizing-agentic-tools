'use strict';

const { Router } = require('express');
const wishlistController = require('../controllers/wishlist.controller');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.use(authenticate);

// GET /api/wishlist
router.get('/', wishlistController.getWishlist);

// POST /api/wishlist/items
router.post('/items', wishlistController.addToWishlist);

// DELETE /api/wishlist/items/:productId
router.delete('/items/:productId', wishlistController.removeFromWishlist);

module.exports = router;
