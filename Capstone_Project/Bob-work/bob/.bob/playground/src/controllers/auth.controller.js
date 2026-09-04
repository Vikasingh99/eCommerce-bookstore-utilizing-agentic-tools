'use strict';

const authService = require('../services/auth.service');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/auth.validators');
const { AppError } = require('../utils/errors');

async function register(req, res, next) {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'Bad Request', result.error.errors[0].message));
    }

    const user = await authService.register(result.data);
    return res.status(201).json({ message: 'Registration successful', user });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'Bad Request', result.error.errors[0].message));
    }

    const tokens = await authService.login(result.data);
    return res.json(tokens);
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const result = refreshSchema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, 'Bad Request', result.error.errors[0].message));
    }

    const tokens = await authService.refresh(result.data.refreshToken);
    return res.json(tokens);
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, refresh };
