'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const { AppError } = require('../utils/errors');

/**
 * Express middleware — validates the Bearer access token.
 *
 * Rejects:
 *  - Missing Authorization header
 *  - Non-Bearer scheme
 *  - Expired, invalid, or malformed tokens
 *  - Refresh tokens (type !== "access")
 *
 * On success: attaches req.user = { id, email, name }
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return next(new AppError(401, 'Unauthorized', 'Authentication required'));
  }

  if (!authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized', 'Invalid authorization scheme'));
  }

  const token = authHeader.slice(7);

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Unauthorized', 'Access token expired'));
    }
    return next(new AppError(401, 'Unauthorized', 'Invalid access token'));
  }

  if (decoded.type !== 'access') {
    return next(new AppError(401, 'Unauthorized', 'Invalid token type'));
  }

  req.user = { id: decoded.userId, email: decoded.email, name: decoded.name };
  return next();
}

module.exports = authenticate;
