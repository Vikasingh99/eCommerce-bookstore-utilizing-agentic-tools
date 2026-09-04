'use strict';

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { registerAndLogin, bearer, getTestProduct } = require('./helpers');

/**
 * Helper: add item to cart and create an order, returning the order.
 */
async function createOrderForUser(accessToken, productId, quantity = 1) {
  await request(app)
    .post('/api/cart/items')
    .set('Authorization', bearer(accessToken))
    .send({ productId, quantity });

  const res = await request(app)
    .post('/api/orders')
    .set('Authorization', bearer(accessToken));

  return res.body.order;
}

describe('Payments', () => {
  let token;
  let product;

  beforeAll(async () => {
    const auth = await registerAndLogin();
    token = auth.accessToken;
    product = await getTestProduct('Atomic Habits');
    // Ensure enough stock for payment tests
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: 100, price: 499 },
    });
    product = await prisma.product.findUnique({ where: { id: product.id } });
  });

  test('POST /api/payments requires authentication', async () => {
    const res = await request(app)
      .post('/api/payments')
      .send({ orderId: 1, paymentMethod: 'CARD' });
    expect(res.status).toBe(401);
  });

  test('POST /api/payments with invalid orderId returns 400', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', bearer(token))
      .send({ orderId: 'abc', paymentMethod: 'CARD' });
    expect(res.status).toBe(400);
  });

  test('POST /api/payments with invalid paymentMethod returns 400', async () => {
    const auth = await registerAndLogin();
    const order = await createOrderForUser(auth.accessToken, product.id, 1);

    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', bearer(auth.accessToken))
      .send({ orderId: order.id, paymentMethod: 'BITCOIN' });
    expect(res.status).toBe(400);
  });

  test('POST /api/payments with non-existent orderId returns 404', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', bearer(token))
      .send({ orderId: 999999, paymentMethod: 'CARD' });
    expect(res.status).toBe(404);
  });

  test('POST /api/payments returns 403 for another user\'s order', async () => {
    const authA = await registerAndLogin();
    const order = await createOrderForUser(authA.accessToken, product.id, 1);

    const authB = await registerAndLogin();
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', bearer(authB.accessToken))
      .send({ orderId: order.id, paymentMethod: 'CARD' });

    expect(res.status).toBe(403);
  });

  test('POST /api/payments processes a successful CARD payment', async () => {
    const auth = await registerAndLogin();
    const order = await createOrderForUser(auth.accessToken, product.id, 2);

    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', bearer(auth.accessToken))
      .send({ orderId: order.id, paymentMethod: 'CARD' });

    expect(res.status).toBe(201);
    expect(res.body.paymentStatus).toBe('SUCCESS');
    expect(res.body.orderStatus).toBe('CONFIRMED');
    expect(res.body.orderId).toBe(order.id);
    expect(res.body.paymentReference).toBeDefined();
    expect(res.body.message).toBe('Purchase confirmed successfully');
  });

  test('POST /api/payments amount comes from server-side order (not client)', async () => {
    const auth = await registerAndLogin();
    const order = await createOrderForUser(auth.accessToken, product.id, 2);

    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', bearer(auth.accessToken))
      .send({ orderId: order.id, paymentMethod: 'UPI', amount: 1 }); // bogus amount ignored

    expect(res.status).toBe(201);
    const expectedAmount = Number(product.price) * 2;
    expect(Number(res.body.amount)).toBe(expectedAmount);
  });

  test('POST /api/payments sets order status to CONFIRMED', async () => {
    const auth = await registerAndLogin();
    const order = await createOrderForUser(auth.accessToken, product.id, 1);

    await request(app)
      .post('/api/payments')
      .set('Authorization', bearer(auth.accessToken))
      .send({ orderId: order.id, paymentMethod: 'NET_BANKING' });

    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    expect(updatedOrder.status).toBe('CONFIRMED');
  });

  test('POST /api/payments duplicate payment on same order returns 400', async () => {
    const auth = await registerAndLogin();
    const order = await createOrderForUser(auth.accessToken, product.id, 1);

    // First payment — success
    await request(app)
      .post('/api/payments')
      .set('Authorization', bearer(auth.accessToken))
      .send({ orderId: order.id, paymentMethod: 'CARD' });

    // Second payment — should fail
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', bearer(auth.accessToken))
      .send({ orderId: order.id, paymentMethod: 'CARD' });

    expect(res.status).toBe(400);
  });

  test('POST /api/payments on already CONFIRMED order returns 400', async () => {
    const auth = await registerAndLogin();
    const order = await createOrderForUser(auth.accessToken, product.id, 1);

    // Force order to CONFIRMED state without payment record
    await prisma.order.update({ where: { id: order.id }, data: { status: 'CONFIRMED' } });

    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', bearer(auth.accessToken))
      .send({ orderId: order.id, paymentMethod: 'CARD' });

    expect(res.status).toBe(400);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
