'use strict';

const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

module.exports = router;
