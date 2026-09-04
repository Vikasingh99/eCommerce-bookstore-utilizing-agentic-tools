'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign an access token.
 * Includes type: "access" so the auth middleware can reject refresh tokens.
 */
function signAccessToken(payload) {
  return jwt.sign(
    { ...payload, type: 'access' },
    env.jwtSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );
}

/**
 * Sign a refresh token.
 * Includes type: "refresh" so the auth middleware can reject it.
 */
function signRefreshToken(payload) {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn }
  );
}

/**
 * Verify an access token. Returns the decoded payload or throws.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

/**
 * Verify a refresh token. Returns the decoded payload or throws.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
