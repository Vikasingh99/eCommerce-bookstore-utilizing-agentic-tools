'use strict';

const prisma = require('../config/prisma');
const { AppError } = require('../utils/errors');

async function getWishlist(userId) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          author: true,
          price: true,
          imageUrl: true,
          rating: true,
          stock: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return items;
}

async function addToWishlist(userId, productId) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(404, 'Not Found', 'Product not found');
  }

  try {
    const item = await prisma.wishlistItem.create({
      data: { userId, productId },
      include: { product: { select: { id: true, title: true, price: true, imageUrl: true } } },
    });
    return item;
  } catch (err) {
    // Unique constraint violation — already in wishlist
    if (err.code === 'P2002') {
      throw new AppError(409, 'Conflict', 'Product is already in your wishlist');
    }
    throw err;
  }
}

async function removeFromWishlist(userId, productId) {
  const item = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (!item) {
    throw new AppError(404, 'Not Found', 'Product not found in wishlist');
  }

  await prisma.wishlistItem.delete({
    where: { userId_productId: { userId, productId } },
  });
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
