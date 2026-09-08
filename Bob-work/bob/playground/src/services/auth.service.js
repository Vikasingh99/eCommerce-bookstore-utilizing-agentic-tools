'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../utils/errors');
const env = require('../config/env');

const SALT_ROUNDS = 10;

/**
 * Register a new user.
 */
async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'Conflict', 'Email address is already in use');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return user;
}

/**
 * Login and return access + refresh tokens.
 */
async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Unauthorized', 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Unauthorized', 'Invalid email or password');
  }

  const payload = { userId: user.id, email: user.email, name: user.name, jti: crypto.randomUUID() };
  const accessToken = signAccessToken(payload);
  const rawRefreshToken = signRefreshToken({ ...payload, jti: crypto.randomUUID() });

  // Persist the refresh token
  const expiresAt = new Date(Date.now() + parseDuration(env.jwtRefreshExpiresIn));
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: rawRefreshToken,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

/**
 * Rotate a refresh token — revoke old one, issue new access token.
 */
async function refresh(rawToken) {
  // Verify JWT signature / expiry first
  let decoded;
  try {
    decoded = verifyRefreshToken(rawToken);
  } catch {
    throw new AppError(401, 'Unauthorized', 'Invalid or expired refresh token');
  }

  if (decoded.type !== 'refresh') {
    throw new AppError(401, 'Unauthorized', 'Invalid token type');
  }

  // Look up the stored record
  const stored = await prisma.refreshToken.findUnique({ where: { token: rawToken } });
  if (!stored || stored.revokedAt !== null) {
    throw new AppError(401, 'Unauthorized', 'Refresh token has been revoked');
  }
  if (stored.expiresAt < new Date()) {
    throw new AppError(401, 'Unauthorized', 'Refresh token has expired');
  }

  // Revoke the used token (rotation)
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) {
    throw new AppError(401, 'Unauthorized', 'User not found');
  }

  const payload = { userId: user.id, email: user.email, name: user.name, jti: crypto.randomUUID() };
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken({ ...payload, jti: crypto.randomUUID() });

  const expiresAt = new Date(Date.now() + parseDuration(env.jwtRefreshExpiresIn));
  await prisma.refreshToken.create({
    data: { userId: user.id, token: newRefreshToken, expiresAt },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

/**
 * Parse simple duration strings like "7d", "15m", "1h" → milliseconds.
 */
function parseDuration(str) {
  const unit = str.slice(-1);
  const value = parseInt(str.slice(0, -1), 10);
  const map = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return (map[unit] || 0) * value;
}

module.exports = { register, login, refresh };
