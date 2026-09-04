'use strict';

/**
 * Shared test helpers — register a user and get an access token.
 * All helpers operate against the real app (supertest integration tests).
 */

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

let _userCounter = 0;

/**
 * Register a fresh user and return { accessToken, refreshToken, user }
 */
async function registerAndLogin(overrides = {}) {
  _userCounter += 1;
  const email = overrides.email || `testuser${_userCounter}_${Date.now()}@example.com`;
  const password = overrides.password || 'password123';
  const name = overrides.name || `Test User ${_userCounter}`;

  await request(app).post('/api/auth/register').send({ name, email, password });
  const res = await request(app).post('/api/auth/login').send({ email, password });

  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
    user: res.body.user,
    email,
    password,
  };
}

/**
 * Return a valid Authorization header value.
 */
function bearer(token) {
  return `Bearer ${token}`;
}

/**
 * Get (or create) a product by title from the seeded data.
 * Falls back to creating a minimal product if the DB isn't seeded.
 */
async function getTestProduct(title = 'Atomic Habits') {
  let product = await prisma.product.findFirst({ where: { title } });
  if (!product) {
    product = await prisma.product.create({
      data: {
        title,
        author: 'Test Author',
        category: 'Test',
        genre: 'Test',
        description: 'Test description',
        price: 499,
        stock: 50,
        publishedBy: 'Test Publisher',
        language: 'English',
        imageUrl: '/images/test.jpg',
        rating: 4.5,
      },
    });
  }
  return product;
}

module.exports = { registerAndLogin, bearer, getTestProduct };
