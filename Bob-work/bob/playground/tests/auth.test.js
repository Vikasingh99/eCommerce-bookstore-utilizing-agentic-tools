'use strict';

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');
const { registerAndLogin, bearer } = require('./helpers');

describe('Authentication', () => {
  // ── Registration ───────────────────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    test('successful registration', async () => {
      const email = `reg_success_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice', email, password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Registration successful');
      expect(res.body.user).toMatchObject({ name: 'Alice', email });
      expect(res.body.user.id).toBeDefined();
    });

    test('duplicate email returns 409', async () => {
      const email = `dup_${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice', email, password: 'password123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice2', email, password: 'password456' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Conflict');
    });

    test('missing name returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: `x_${Date.now()}@example.com`, password: 'password123' });

      expect(res.status).toBe(400);
    });

    test('missing email returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Bob', password: 'password123' });

      expect(res.status).toBe(400);
    });

    test('short password returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Bob', email: `x2_${Date.now()}@example.com`, password: '123' });

      expect(res.status).toBe(400);
    });
  });

  // ── Login ─────────────────────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    test('successful login returns tokens', async () => {
      const { email, password } = await registerAndLogin();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    test('wrong password returns 401', async () => {
      const { email } = await registerAndLogin();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    test('unknown email returns 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  // ── Middleware: access token ───────────────────────────────────────────────

  describe('Access token middleware', () => {
    test('missing Authorization header returns 401', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(401);
    });

    test('invalid token returns 401', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', 'Bearer not.a.valid.token');
      expect(res.status).toBe(401);
    });

    test('using refresh token as access token returns 401', async () => {
      const { refreshToken } = await registerAndLogin();
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', bearer(refreshToken));
      expect(res.status).toBe(401);
    });
  });

  // ── Refresh token ─────────────────────────────────────────────────────────

  describe('POST /api/auth/refresh', () => {
    test('valid refresh token returns new tokens', async () => {
      const { refreshToken } = await registerAndLogin();
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    test('invalid refresh token returns 401', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' });

      expect(res.status).toBe(401);
    });

    test('missing refresh token returns 400', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
    });

    test('used refresh token cannot be reused (rotation)', async () => {
      const { refreshToken } = await registerAndLogin();
      // First use — should succeed
      await request(app).post('/api/auth/refresh').send({ refreshToken });
      // Second use — should fail (revoked)
      const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
      expect(res.status).toBe(401);
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
