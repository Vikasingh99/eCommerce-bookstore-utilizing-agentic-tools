'use strict';

const cartService = require('../services/cart.service');
const { addToCartSchema, updateCartSchema } = require('../validators/shop.validators');
const { AppError } = require('../utils/errors');

async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user.id);
    return res.json({ cart });
  } catch (err) {
    return next(err);
  }
}

async function addToCart(req, res, next) {
  try {
    const result = addToCartSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'Bad Request', result.error.errors[0].message));
    }

    const { productId, quantity } = result.data;
    const item = await cartService.addToCart(req.user.id, productId, quantity);
    return res.status(201).json({ message: 'Added to cart', item });
  } catch (err) {
    return next(err);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      return next(new AppError(400, 'Bad Request', 'Invalid product ID'));
    }

    const result = updateCartSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'Bad Request', result.error.errors[0].message));
    }

    const item = await cartService.updateCartItem(req.user.id, productId, result.data.quantity);
    return res.json({ message: 'Cart updated', item });
  } catch (err) {
    return next(err);
  }
}

async function removeFromCart(req, res, next) {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      return next(new AppError(400, 'Bad Request', 'Invalid product ID'));
    }

    await cartService.removeFromCart(req.user.id, productId);
    return res.json({ message: 'Removed from cart' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
