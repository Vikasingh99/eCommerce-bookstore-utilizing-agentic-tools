'use strict';

const orderService = require('../services/order.service');
const { AppError } = require('../utils/errors');

async function createOrder(req, res, next) {
  try {
    const order = await orderService.createOrder(req.user.id);
    return res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    return next(err);
  }
}

async function getOrder(req, res, next) {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      return next(new AppError(400, 'Bad Request', 'Invalid order ID'));
    }

    const order = await orderService.getOrderById(orderId, req.user.id);
    return res.json({ order });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createOrder, getOrder };
