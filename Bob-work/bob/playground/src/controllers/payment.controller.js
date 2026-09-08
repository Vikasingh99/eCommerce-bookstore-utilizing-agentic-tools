'use strict';

const paymentService = require('../services/payment.service');
const { AppError } = require('../utils/errors');

async function processPayment(req, res, next) {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || typeof orderId !== 'number' || !Number.isInteger(orderId) || orderId < 1) {
      return next(new AppError(400, 'Bad Request', 'orderId must be a positive integer'));
    }

    const validMethods = ['CARD', 'UPI', 'NET_BANKING'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return next(
        new AppError(400, 'Bad Request', `paymentMethod must be one of: ${validMethods.join(', ')}`)
      );
    }

    const result = await paymentService.processPayment(req.user.id, orderId, paymentMethod);

    return res.status(201).json({
      message: 'Purchase confirmed successfully',
      orderId: result.orderId,
      paymentReference: result.paymentReference,
      paymentStatus: result.status,
      orderStatus: 'CONFIRMED',
      paymentId: result.paymentId,
      amount: result.amount,
      paymentMethod: result.paymentMethod,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { processPayment };
