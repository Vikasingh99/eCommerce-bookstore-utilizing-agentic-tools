'use strict';

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { registerAndLogin, bearer, getTestProduct } = require('./helpers');

/**
 * Helper: add a product to the authenticated user's cart.
 */
async function addToCart(token, productId, quantity = 1) {
  return request(app)
    .post('/api/cart/items')
    .set('Authorization', bearer(token))
    .send({ productId, quantity });
}

describe('Orders', () => {
  let token;
  let product;

  beforeAll(async () => {
    const auth = await registerAndLogin();
    token = auth.accessToken;
    // Use a product with plenty of stock
    product = await getTestProduct('Atomic Habits');
    // Ensure stock is sufficient for tests
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: 50, price: 499 },
    });
    product = await prisma.product.findUnique({ where: { id: product.id } });
  });

  test('POST /api/orders requires authentication', async () => {
    const res = await request(app).post('/api/orders');
    expect(res.status).toBe(401);
  });

  test('POST /api/orders with empty cart returns 400', async () => {
    const auth = await registerAndLogin();
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', bearer(auth.accessToken));
    expect(res.status).toBe(400);
    // New user has no cart record → "Cart not found", or empty cart → "Cart is empty"
    expect(res.body.error).toBe('Bad Request');
  });

  test('POST /api/orders creates order and clears cart', async () => {
    // Add item to cart
    await addToCart(token, product.id, 2);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', bearer(token));

    expect(res.status).toBe(201);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.status).toBe('PENDING');
    expect(res.body.order.orderItems.length).toBeGreaterThan(0);

    // Cart should be empty after order
    const cartRes = await request(app)
      .get('/api/cart')
      .set('Authorization', bearer(token));
    expect(cartRes.body.cart.cartItems.length).toBe(0);
  });

  test('POST /api/orders calculates total server-side (price × quantity)', async () => {
    await addToCart(token, product.id, 3);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', bearer(token));

    expect(res.status).toBe(201);
    const expectedTotal = Number(product.price) * 3;
    expect(Number(res.body.order.totalAmount)).toBe(expectedTotal);
  });

  test('POST /api/orders stores purchase-time price in OrderItem', async () => {
    await addToCart(token, product.id, 1);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', bearer(token));

    expect(res.status).toBe(201);
    const item = res.body.order.orderItems.find((i) => i.productId === product.id);
    expect(item).toBeDefined();
    expect(Number(item.price)).toBe(Number(product.price));
  });

  test('POST /api/orders reduces product stock', async () => {
    const stockBefore = (await prisma.product.findUnique({ where: { id: product.id } })).stock;
    await addToCart(token, product.id, 2);

    await request(app)
      .post('/api/orders')
      .set('Authorization', bearer(token));

    const stockAfter = (await prisma.product.findUnique({ where: { id: product.id } })).stock;
    expect(stockAfter).toBe(stockBefore - 2);
  });

  test('POST /api/orders with insufficient stock returns 400 and does not deduct stock', async () => {
    // Create a product with very low stock
    const lowStockProduct = await prisma.product.create({
      data: {
        title: `LowStock_${Date.now()}`,
        author: 'Author',
        category: 'Test',
        genre: 'Test',
        description: 'Test',
        price: 100,
        stock: 1,
        publishedBy: 'Pub',
        language: 'English',
        imageUrl: '/images/test.jpg',
        rating: 3.0,
      },
    });

    // Try to add more than available stock
    const auth = await registerAndLogin();
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', bearer(auth.accessToken))
      .send({ productId: lowStockProduct.id, quantity: 1 });

    // Manually set stock to 0 to simulate race
    await prisma.product.update({ where: { id: lowStockProduct.id }, data: { stock: 0 } });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', bearer(auth.accessToken));

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient stock/i);

    // Stock should remain unchanged (0)
    const afterProduct = await prisma.product.findUnique({ where: { id: lowStockProduct.id } });
    expect(afterProduct.stock).toBe(0);
  });

  test('GET /api/orders/:id retrieves an order', async () => {
    await addToCart(token, product.id, 1);
    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', bearer(token));
    const orderId = createRes.body.order.id;

    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.order.id).toBe(orderId);
    expect(res.body.order.status).toBe('PENDING');
    expect(Array.isArray(res.body.order.orderItems)).toBe(true);
  });

  test('GET /api/orders/:id returns 404 for non-existent order', async () => {
    const res = await request(app)
      .get('/api/orders/999999')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(404);
  });

  test('GET /api/orders/:id returns 403 for another user\'s order', async () => {
    await addToCart(token, product.id, 1);
    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', bearer(token));
    const orderId = createRes.body.order.id;

    const authB = await registerAndLogin();
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', bearer(authB.accessToken));

    expect(res.status).toBe(403);
  });

  test('GET /api/orders/:id requires authentication', async () => {
    const res = await request(app).get('/api/orders/1');
    expect(res.status).toBe(401);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
