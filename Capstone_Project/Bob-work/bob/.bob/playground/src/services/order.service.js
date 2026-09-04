'use strict';

const prisma = require('../config/prisma');
const { AppError } = require('../utils/errors');

/**
 * Create an order from the authenticated user's cart.
 * Runs entirely inside a Prisma transaction.
 */
async function createOrder(userId) {
  // 1. Find the user's cart (no auto-create — cart must exist)
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      cartItems: {
        include: { product: true },
      },
    },
  });

  // 2. Reject if cart does not exist
  if (!cart) {
    throw new AppError(400, 'Bad Request', 'Cart not found');
  }

  // 3. Reject if cart is empty
  if (cart.cartItems.length === 0) {
    throw new AppError(400, 'Bad Request', 'Cart is empty');
  }

  // 4. Verify every product exists and has sufficient stock
  for (const item of cart.cartItems) {
    if (!item.product) {
      throw new AppError(400, 'Bad Request', `Product ${item.productId} not found`);
    }
    if (item.product.stock < item.quantity) {
      throw new AppError(
        400,
        'Bad Request',
        `Insufficient stock for "${item.product.title}". Available: ${item.product.stock}, requested: ${item.quantity}`
      );
    }
  }

  // 5. Calculate total server-side
  const totalAmount = cart.cartItems.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  // 6. Transaction: create order + items, reduce stock, clear cart
  const order = await prisma.$transaction(async (tx) => {
    // Create the Order
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
      },
    });

    // Create OrderItems with purchase-time price
    await tx.orderItem.createMany({
      data: cart.cartItems.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price),
      })),
    });

    // Reduce stock for each product
    for (const item of cart.cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear the cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Return the full order with items
    return tx.order.findUnique({
      where: { id: newOrder.id },
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, title: true, author: true, imageUrl: true } },
          },
        },
      },
    });
  });

  return order;
}

/**
 * Retrieve a single order by ID, enforcing user ownership.
 */
async function getOrderById(orderId, userId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: { select: { id: true, title: true, author: true, imageUrl: true } },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, 'Not Found', 'Order not found');
  }

  if (order.userId !== userId) {
    throw new AppError(403, 'Forbidden', 'You do not have access to this order');
  }

  return order;
}

module.exports = { createOrder, getOrderById };
