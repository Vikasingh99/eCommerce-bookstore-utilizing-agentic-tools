'use strict';

const prisma = require('../config/prisma');
const { AppError } = require('../utils/errors');

// Get or create the user's cart
async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
}

async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  const cartWithItems = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      cartItems: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              author: true,
              price: true,
              imageUrl: true,
              stock: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  return cartWithItems;
}

async function addToCart(userId, productId, quantity) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(404, 'Not Found', 'Product not found');
  }
  if (product.stock < quantity) {
    throw new AppError(400, 'Bad Request', `Insufficient stock. Available: ${product.stock}`);
  }

  const cart = await getOrCreateCart(userId);

  // Upsert: if product already in cart, update quantity; otherwise create
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (product.stock < newQty) {
      throw new AppError(400, 'Bad Request', `Insufficient stock. Available: ${product.stock}`);
    }
    const item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
      include: { product: { select: { id: true, title: true, price: true } } },
    });
    return item;
  }

  const item = await prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity },
    include: { product: { select: { id: true, title: true, price: true } } },
  });
  return item;
}

async function updateCartItem(userId, productId, quantity) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError(404, 'Not Found', 'Product not found');
  }
  if (product.stock < quantity) {
    throw new AppError(400, 'Bad Request', `Insufficient stock. Available: ${product.stock}`);
  }

  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (!item) {
    throw new AppError(404, 'Not Found', 'Product not found in cart');
  }

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
    include: { product: { select: { id: true, title: true, price: true } } },
  });
  return updated;
}

async function removeFromCart(userId, productId) {
  const cart = await getOrCreateCart(userId);
  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (!item) {
    throw new AppError(404, 'Not Found', 'Product not found in cart');
  }

  await prisma.cartItem.delete({ where: { id: item.id } });
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
