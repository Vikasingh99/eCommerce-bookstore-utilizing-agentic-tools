'use strict';

const prisma = require('../config/prisma');

// Home: lightweight fields only
async function getHomeProducts() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, price: true, imageUrl: true },
    orderBy: { rating: 'desc' },
  });
  return products;
}

// Catalogue: full fields, optional search + category filter
async function getProducts({ search, category } = {}) {
  const where = {};

  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } },
      { genre: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });
  return products;
}

// Single product
async function getProductById(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  return product;
}

module.exports = { getHomeProducts, getProducts, getProductById };
