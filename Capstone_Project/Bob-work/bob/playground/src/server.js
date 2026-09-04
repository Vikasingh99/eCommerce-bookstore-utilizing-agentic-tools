'use strict';

const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

async function start() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    app.listen(env.port, () => {
      console.log(`Bookstore API listening on port ${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
