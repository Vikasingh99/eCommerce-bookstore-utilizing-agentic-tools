'use strict';

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { registerAndLogin, bearer, getTestProduct } = require('./helpers');

describe('Wishlist', () => {
  let token;
  let userId;
  let product;

  beforeAll(async () => {
    const auth = await registerAndLogin();
    token = auth.accessToken;
    userId = auth.user.id;
    product = await getTestProduct();
  });

  test('GET /api/wishlist requires authentication', async () => {
    const res = await request(app).get('/api/wishlist');
    expect(res.status).toBe(401);
  });

  test('GET /api/wishlist returns empty array for new user', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.wishlist)).toBe(true);
  });

  test('POST /api/wishlist/items adds a product', async () => {
    const res = await request(app)
      .post('/api/wishlist/items')
      .set('Authorization', bearer(token))
      .send({ productId: product.id });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Added to wishlist');
    expect(res.body.item.productId).toBe(product.id);
  });

  test('POST /api/wishlist/items duplicate returns 409', async () => {
    const res = await request(app)
      .post('/api/wishlist/items')
      .set('Authorization', bearer(token))
      .send({ productId: product.id });
    expect(res.status).toBe(409);
  });

  test('GET /api/wishlist returns the added item', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    const ids = res.body.wishlist.map((i) => i.productId);
    expect(ids).toContain(product.id);
  });

  test('DELETE /api/wishlist/items/:productId removes the item', async () => {
    const res = await request(app)
      .delete(`/api/wishlist/items/${product.id}`)
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Removed from wishlist');
  });

  test('DELETE /api/wishlist/items/:productId for non-existing item returns 404', async () => {
    const res = await request(app)
      .delete(`/api/wishlist/items/${product.id}`)
      .set('Authorization', bearer(token));
    expect(res.status).toBe(404);
  });

  test('User B cannot see User A wishlist items (ownership)', async () => {
    // Add product back for user A
    await request(app)
      .post('/api/wishlist/items')
      .set('Authorization', bearer(token))
      .send({ productId: product.id });

    // User B sees their own empty wishlist
    const authB = await registerAndLogin();
    const resB = await request(app)
      .get('/api/wishlist')
      .set('Authorization', bearer(authB.accessToken));
    expect(resB.status).toBe(200);
    const idsB = resB.body.wishlist.map((i) => i.productId);
    expect(idsB).not.toContain(product.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
