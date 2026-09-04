'use strict';

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { registerAndLogin, bearer, getTestProduct } = require('./helpers');

describe('Home', () => {
  test('GET /api/home is accessible without authentication', async () => {
    const res = await request(app).get('/api/home');
    expect(res.status).toBe(200);
  });

  test('GET /api/home returns products array', async () => {
    const res = await request(app).get('/api/home');
    expect(res.status).toBe(200);
    expect(res.body.products).toBeDefined();
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  test('GET /api/home product summary contains id, title, price, imageUrl', async () => {
    const res = await request(app).get('/api/home');
    expect(res.status).toBe(200);
    if (res.body.products.length > 0) {
      const p = res.body.products[0];
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('title');
      expect(p).toHaveProperty('price');
      expect(p).toHaveProperty('imageUrl');
    }
  });
});

describe('Products', () => {
  let token;

  beforeAll(async () => {
    const auth = await registerAndLogin();
    token = auth.accessToken;
  });

  test('GET /api/products requires authentication', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
  });

  test('GET /api/products returns products for authenticated user', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  test('GET /api/products includes rating field (static)', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    if (res.body.products.length > 0) {
      expect(res.body.products[0]).toHaveProperty('rating');
    }
  });

  test('GET /api/products?search= filters by title', async () => {
    const res = await request(app)
      .get('/api/products?search=Atomic')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    if (res.body.products.length > 0) {
      const titles = res.body.products.map((p) => p.title.toLowerCase());
      expect(titles.some((t) => t.includes('atomic'))).toBe(true);
    }
  });

  test('GET /api/products?category= filters by category', async () => {
    const res = await request(app)
      .get('/api/products?category=Finance')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    res.body.products.forEach((p) => {
      expect(p.category.toLowerCase()).toBe('finance');
    });
  });

  test('GET /api/products/:id returns a single product', async () => {
    const product = await getTestProduct();
    const res = await request(app)
      .get(`/api/products/${product.id}`)
      .set('Authorization', bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.product.id).toBe(product.id);
  });

  test('GET /api/products/:id returns 404 for non-existent product', async () => {
    const res = await request(app)
      .get('/api/products/999999')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(404);
  });

  test('GET /api/products/:id with invalid id returns 400', async () => {
    const res = await request(app)
      .get('/api/products/abc')
      .set('Authorization', bearer(token));
    expect(res.status).toBe(400);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
