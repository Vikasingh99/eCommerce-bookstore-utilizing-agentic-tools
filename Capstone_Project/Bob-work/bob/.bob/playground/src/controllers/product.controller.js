'use strict';

const productService = require('../services/product.service');
const { AppError } = require('../utils/errors');

async function getHome(req, res, next) {
  try {
    const products = await productService.getHomeProducts();
    return res.json({ products });
  } catch (err) {
    return next(err);
  }
}

async function getProducts(req, res, next) {
  try {
    const { search, category } = req.query;
    const products = await productService.getProducts({ search, category });
    return res.json({ products });
  } catch (err) {
    return next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return next(new AppError(400, 'Bad Request', 'Invalid product ID'));
    }

    const product = await productService.getProductById(id);
    if (!product) {
      return next(new AppError(404, 'Not Found', 'Product not found'));
    }

    return res.json({ product });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getHome, getProducts, getProductById };
