# Bookstore Backend

A simple REST API backend for an E-Commerce Book Store, built with Node.js, Express, PostgreSQL, and Prisma.

---

## Project Overview

This backend powers a bookstore e-commerce platform. Users can browse books on the public home page, register and log in to access the catalogue, manage a wishlist and cart, place orders, and complete a simulated (fake) payment.

---

## Technology Stack

| Technology   | Purpose                          |
|--------------|----------------------------------|
| Node.js      | JavaScript runtime               |
| Express.js   | HTTP server and routing          |
| PostgreSQL    | Relational database              |
| Prisma ORM   | Database access and migrations   |
| JWT          | Access and refresh token auth    |
| Zod          | Request validation               |
| bcryptjs     | Password hashing                 |
| Jest         | Test runner                      |
| Supertest    | HTTP integration testing         |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v14 or higher
- npm v8 or higher

---

## Installation

```bash
npm install
```

---

## Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

`.env.example`:

```
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/bookstore"
JWT_SECRET="change-me-to-a-long-random-secret"
JWT_REFRESH_SECRET="change-me-to-a-different-long-random-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
NODE_ENV="development"
```

> ⚠️ Never commit your `.env` file or real credentials to version control.

---

## Database Setup

### 1. Create the PostgreSQL database

```sql
CREATE DATABASE bookstore;
```

### 2. Run Prisma migrations

```bash
npm run db:migrate
```

This creates all tables defined in [`prisma/schema.prisma`](prisma/schema.prisma).

### 3. Generate the Prisma client

```bash
npm run db:generate
```

### 4. Seed the database

```bash
npm run db:seed
```

This inserts 10 sample books into the `Product` table.

---

## Running the Application

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

The server starts on the port defined in your `.env` (default: `3000`).

---

## Testing

Run the full test suite:

```bash
npm test
```

Tests use Jest and Supertest and run against a real PostgreSQL database. Make sure your `.env` is configured and the database is running before executing tests.

> Tests run sequentially (`--runInBand`) to avoid transaction conflicts.

### Test coverage

| Suite        | What is tested                                                       |
|--------------|----------------------------------------------------------------------|
| Auth         | Register, login, token validation, refresh, rotation                 |
| Home         | Public access, response shape                                        |
| Products     | Auth required, search, category filter, details, not found           |
| Wishlist     | Add, duplicate, get, remove, ownership                               |
| Cart         | Add, update, remove, get, stock validation, ownership                |
| Orders       | Create, total calculation, stock reduction, cart clearing, get, auth |
| Payments     | Success, duplicate, wrong owner, invalid method, server-side amount  |

---

## API Documentation

The full OpenAPI 3.x specification is located at:

```
openapi.yaml
```

You can view it interactively using any OpenAPI viewer. For example:

- **Swagger UI** — paste the contents of `openapi.yaml` into [editor.swagger.io](https://editor.swagger.io)
- **VS Code** — install the [OpenAPI (Swagger) Editor](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi) extension

---

## Authentication Flow

```
POST /api/auth/register   →  Create account
POST /api/auth/login      →  Receive { accessToken, refreshToken }
                               ↓
                         Use accessToken as:
                         Authorization: Bearer <accessToken>
                               ↓
                     Access protected endpoints
                               ↓
              accessToken expires (default: 15 minutes)
                               ↓
POST /api/auth/refresh    →  Send { refreshToken }
                               ↓
                    Receive new { accessToken, refreshToken }
```

---

## Main User Flow

```
GET  /api/home                   →  Browse books (public, no login needed)
POST /api/auth/register          →  Create account
POST /api/auth/login             →  Login, receive tokens

GET  /api/products               →  Browse full catalogue (auth required)
GET  /api/products/:id           →  View product details

POST /api/wishlist/items         →  Save book to wishlist
POST /api/cart/items             →  Add book to cart
PUT  /api/cart/items/:productId  →  Update cart quantity

POST /api/orders                 →  Create order from cart
                                    (server calculates total, deducts stock,
                                     clears cart)

POST /api/payments               →  Fake payment
                                    (order status → CONFIRMED)

GET  /api/orders/:id             →  View purchase confirmation
```

---

## Available Scripts

| Script               | Description                          |
|----------------------|--------------------------------------|
| `npm start`          | Start production server              |
| `npm run dev`        | Start dev server with nodemon        |
| `npm test`           | Run test suite                       |
| `npm run db:migrate` | Run Prisma migrations (dev)          |
| `npm run db:generate`| Generate Prisma client               |
| `npm run db:seed`    | Seed the database with sample books  |
| `npm run db:studio`  | Open Prisma Studio (DB GUI)          |

---

## Project Structure

```
src/
├── app.js                  # Express app setup and route registration
├── server.js               # HTTP server entry point
├── config/
│   ├── env.js              # Environment variable validation
│   └── prisma.js           # Prisma client singleton
├── controllers/            # Route handlers (thin layer)
├── services/               # Business logic
├── routes/                 # Express router definitions
├── middleware/
│   └── authenticate.js     # JWT access token middleware
├── utils/
│   ├── errors.js           # AppError class + global error handler
│   └── jwt.js              # Token sign/verify helpers
└── validators/             # Zod schemas for request validation

prisma/
├── schema.prisma           # Database schema
└── seed.js                 # Sample data seeder

tests/
├── helpers.js              # Shared test utilities
├── auth.test.js
├── product.test.js
├── wishlist.test.js
├── cart.test.js
├── order.test.js
└── payment.test.js

openapi.yaml                # OpenAPI 3.x API specification
```
