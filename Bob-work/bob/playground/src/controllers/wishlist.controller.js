'use strict';

const wishlistService = require('../services/wishlist.service');
const { addToWishlistSchema } = require('../validators/shop.validators');
const { AppError } = require('../utils/errors');

async function getWishlist(req, res, next) {
  try {
    const items = await wishlistService.getWishlist(req.user.id);
    return res.json({ wishlist: items });
  } catch (err) {
    return next(err);
  }
}

async function addToWishlist(req, res, next) {
  try {
    const result = addToWishlistSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'Bad Request', result.error.errors[0].message));
    }

    const item = await wishlistService.addToWishlist(req.user.id, result.data.productId);
    return res.status(201).json({ message: 'Added to wishlist', item });
  } catch (err) {
    return next(err);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      return next(new AppError(400, 'Bad Request', 'Invalid product ID'));
    }

    await wishlistService.removeFromWishlist(req.user.id, productId);
    return res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
