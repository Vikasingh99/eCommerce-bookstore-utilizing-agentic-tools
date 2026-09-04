'use strict';

const { Router } = require('express');
const productController = require('../controllers/product.controller');
const authenticate = require('../middleware/authenticate');

const router = Router();

// GET /api/home — public
router.get('/home', productController.getHome);

// GET /api/products — protected
router.get('/products', authenticate, productController.getProducts);

// GET /api/products/:id — protected
router.get('/products/:id', authenticate, productController.getProductById);

module.exports = router;
