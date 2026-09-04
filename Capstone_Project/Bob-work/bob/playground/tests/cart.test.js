'use strict';

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { registerAndLogin, bearer, getTestProduct } = require('./helpers');

describe('Cart', () => {
  let token;
  let product;

  beforeAll(async () => {
    const auth = await registerAndLogin();
    token = auth.accessToken;
    product = await getTestProduct();
  });

  test('GET /api/cart requires authentication', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  test('GET /api/cart returns cart for authenticated user', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.cart).toBeDefined();
    expect(Array.isArray(res.body.cart.cartItems)).toBe(true);
  });

  test('POST /api/cart/items adds a product', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', bearer(token))
      .send({ productId: product.id, quantity: 1 });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Added to cart');
    expect(res.body.item.productId).toBe(product.id);
  });

  test('POST /api/cart/items with invalid productId returns 404', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', bearer(token))
      .send({ productId: 999999, quantity: 1 });
    expect(res.status).toBe(404);
  });

  test('POST /api/cart/items with quantity 0 returns 400', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', bearer(token))
      .send({ productId: product.id, quantity: 0 });
    expect(res.status).toBe(400);
  });

  test('POST /api/cart/items with excessive quantity returns 400', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', bearer(token))
      .send({ productId: product.id, quantity: 999999 });
    expect(res.status).toBe(400);
  });

  test('PUT /api/cart/items/:productId updates quantity', async () => {
    const res = await request(app)
      .put(`/api/cart/items/${product.id}`)
      .set('Authorization', bearer(token))
      .send({ quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.item.quantity).toBe(2);
  });

  test('PUT /api/cart/items/:productId with invalid quantity returns 400', async () => {
    const res = await request(app)
      .put(`/api/cart/items/${product.id}`)
      .set('Authorization', bearer(token))
      .send({ quantity: -1 });
    expect(res.status).toBe(400);
  });

  test('GET /api/cart returns the updated item', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    const item = res.body.cart.cartItems.find((i) => i.productId === product.id);
    expect(item).toBeDefined();
    expect(item.quantity).toBe(2);
  });

  test('DELETE /api/cart/items/:productId removes the item', async () => {
    const res = await request(app)
      .delete(`/api/cart/items/${product.id}`)
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Removed from cart');
  });

  test('DELETE /api/cart/items/:productId for non-existing item returns 404', async () => {
    const res = await request(app)
      .delete(`/api/cart/items/${product.id}`)
      .set('Authorization', bearer(token));
    expect(res.status).toBe(404);
  });

  test('User B cannot see User A cart items (ownership)', async () => {
    // Add to user A cart
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', bearer(token))
      .send({ productId: product.id, quantity: 1 });

    // User B gets their own empty cart
    const authB = await registerAndLogin();
    const resB = await request(app)
      .get('/api/cart')
      .set('Authorization', bearer(authB.accessToken));
    expect(resB.status).toBe(200);
    const itemsB = resB.body.cart.cartItems;
    const found = itemsB.find((i) => i.productId === product.id);
    expect(found).toBeUndefined();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
