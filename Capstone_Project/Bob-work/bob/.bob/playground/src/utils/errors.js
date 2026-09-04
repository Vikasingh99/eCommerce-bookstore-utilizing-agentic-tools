'use strict';

/**
 * AppError — a known, expected error that carries an HTTP status code.
 * Throw this from services/controllers; the global error handler will
 * format it as a clean JSON response without leaking stack traces.
 */
class AppError extends Error {
  constructor(statusCode, error, message) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = true;
  }
}

/**
 * Global Express error-handling middleware.
 * Must be registered LAST (after all routes).
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.error,
      message: err.message,
    });
  }

  // Unexpected errors — log internally, return generic message
  console.error('Unexpected error:', err);
  return res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
}

module.exports = { AppError, errorHandler };
