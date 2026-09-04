'use strict';

const prisma = require('../config/prisma');
const { AppError } = require('../utils/errors');

/**
 * Generate a simple fake payment reference like "PAY-101001"
 */
function generatePaymentReference(orderId) {
  const suffix = String(Date.now()).slice(-3);
  return `PAY-${orderId}${suffix}`;
}

/**
 * Process a fake payment for an order.
 */
async function processPayment(userId, orderId, paymentMethod) {
  // 1. Find the order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) {
    throw new AppError(404, 'Not Found', 'Order not found');
  }

  // 2. Verify ownership
  if (order.userId !== userId) {
    throw new AppError(403, 'Forbidden', 'You do not have access to this order');
  }

  // 3. Verify order is eligible for payment (must be PENDING)
  if (order.status !== 'PENDING') {
    throw new AppError(400, 'Bad Request', `Order cannot be paid. Current status: ${order.status}`);
  }

  // 4. Prevent duplicate payments
  if (order.payment) {
    throw new AppError(400, 'Bad Request', 'This order has already been paid');
  }

  // 5. Amount comes from server-side order — never the client
  const amount = Number(order.totalAmount);
  const paymentReference = generatePaymentReference(orderId);

  // 6. Transaction: create Payment + confirm Order
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        orderId,
        paymentReference,
        paymentMethod,
        amount,
        status: 'SUCCESS',
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });

    return payment;
  });

  return {
    paymentId: result.id,
    paymentReference: result.paymentReference,
    orderId,
    amount,
    paymentMethod,
    status: result.status,
  };
}

module.exports = { processPayment };
