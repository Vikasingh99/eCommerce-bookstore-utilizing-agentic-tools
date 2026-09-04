'use strict';

const { z } = require('zod');

const addToWishlistSchema = z.object({
  productId: z.number().int().positive('productId must be a positive integer'),
});

const addToCartSchema = z.object({
  productId: z.number().int().positive('productId must be a positive integer'),
  quantity: z.number().int().positive('quantity must be a positive integer'),
});

const updateCartSchema = z.object({
  quantity: z.number().int().positive('quantity must be a positive integer'),
});

module.exports = { addToWishlistSchema, addToCartSchema, updateCartSchema };
