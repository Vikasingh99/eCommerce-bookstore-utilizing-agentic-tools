# Book Store Capstone

A full-stack bookstore platform built with a Node.js + Express backend and a Next.js storefront. The solution includes user authentication, product catalog browsing, wishlist and cart management, order creation, and a simulated payment flow.

This project is structured as a monorepo-like workspace with two main application layers:

- `playground/` — backend API and database layer
- `frontend/bookstore/` — customer-facing web application

## Architecture Overview

```mermaid
flowchart LR
    User[Customer] --> UI[Next.js Frontend]
    UI --> API[Express REST API]
    API --> DB[(PostgreSQL)]
    API --> JWT[JWT Authentication]
    UI --> Storage[Local Storage + Cookies]
```

## Core Features

- User registration and login
- JWT-based authentication with refresh token rotation
- Product catalogue with search and category filtering
- Wishlist management
- Cart creation and quantity updates
- Order creation from the cart
- Payment simulation and order confirmation
- Responsive storefront UI
- Prisma ORM for database access and migrations
- Automated API testing with Jest and Supertest

## Tech Stack

### Backend

- Node.js 18+
- Express.js
- PostgreSQL
- Prisma ORM
- JWT
- bcryptjs
- Zod
- Jest + Supertest

### Frontend

- Next.js 16
- React 19
- Bootstrap 5
- Axios

## Repository Structure

```text
Book_Store_Capstone/
├── README.md
├── db/
├── frontend/
│   └── bookstore/
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── next.config.mjs
│       └── README.md
├── logs/
├── playground/
│   ├── prisma/
│   ├── src/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   ├── openapi.yaml
│   └── README.md
└── settings/
```

## Prerequisites

Before running the application, make sure the following are installed:

- Node.js 18 or newer
- npm 9 or newer
- PostgreSQL 14 or newer
- Git

Optional but useful:

- Prisma Studio
- Postman for API testing
- Docker for local database provisioning

## Environment Setup

### 1. Backend environment

Create a `.env` file inside `playground/` based on the example:

```bash
cd Book_Store_Capstone/playground
cp .env.example .env
```

Example content:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bookstore"
JWT_SECRET="replace-with-a-long-random-string"
JWT_REFRESH_SECRET="replace-with-a-different-long-random-string"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
NODE_ENV="development"
```

Important production notes:

- Never commit `.env` files to source control.
- Use long random secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- Use a strong DB password for production deployments.

### 2. Frontend environment

Create a `.env.local` file in `frontend/bookstore/`:

```bash
cd Book_Store_Capstone/frontend/bookstore
copy .env.example .env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

If your backend is running on a different port, update the value accordingly.

## Local Development Setup

### 1. Install dependencies

```bash
cd Book_Store_Capstone/playground
npm install

cd ../frontend/bookstore
npm install
```

### 2. Create the PostgreSQL database

Create a database named `bookstore` in PostgreSQL.

```sql
CREATE DATABASE bookstore;
```

### 3. Generate Prisma client and apply migrations

From the backend directory:

```bash
cd Book_Store_Capstone/playground
npx prisma generate
npm run db:migrate
```

If you need to reset the database during local development:

```bash
npx prisma migrate reset
```

### 4. Seed the database

```bash
npm run db:seed
```

This inserts sample book data for local browsing and testing.

## Running the Project

### Backend

```bash
cd Book_Store_Capstone/playground
npm run dev
```

The API runs on:

- http://localhost:3000

### Frontend

```bash
cd Book_Store_Capstone/frontend/bookstore
npm run dev
```

The frontend runs on:

- http://localhost:3000 by default in development unless configured otherwise

> If the frontend and backend are on different ports, make sure `NEXT_PUBLIC_API_URL` matches the backend API URL.

## Production Deployment

### Recommended production setup

Use separate production environments for:

- PostgreSQL database
- Backend API service
- Frontend Next.js app
- Environment variables managed by a secrets manager or platform secret store

### Backend production run

```bash
cd Book_Store_Capstone/playground
npm install --production
npm run db:generate
npm run db:migrate:prod
NODE_ENV=production npm start
```

### Frontend production build

```bash
cd Book_Store_Capstone/frontend/bookstore
npm install
npm run build
npm run start
```

For production hosting, the frontend should usually be deployed on a managed platform such as Vercel, and the backend should be deployed on a Node-compatible service such as Render, Railway, Azure App Service, or a VM/container host.

## Authentication Model

The backend issues two JWT tokens:

- access token: short-lived, used for protected API requests
- refresh token: long-lived, used to mint a new access token

### Token behavior

- Access token is sent in the `Authorization` header as:

```http
Authorization: Bearer <access_token>
```

- Refresh tokens are rotated on use to improve security.
- Refresh tokens are stored in the database for validation and revocation.

## Main API Endpoints

### Public endpoints

| Method | Endpoint             | Purpose                   |
| ------ | -------------------- | ------------------------- |
| GET    | `/api/health`        | Health check              |
| GET    | `/api/home`          | Public featured products  |
| POST   | `/api/auth/register` | Create a new user         |
| POST   | `/api/auth/login`    | Log in and receive tokens |
| POST   | `/api/auth/refresh`  | Rotate refresh token      |

### Protected endpoints

| Method | Endpoint                         | Purpose                      |
| ------ | -------------------------------- | ---------------------------- |
| GET    | `/api/products`                  | Browse the product catalogue |
| GET    | `/api/products/:id`              | Get product details          |
| GET    | `/api/wishlist`                  | Get wishlist                 |
| POST   | `/api/wishlist/items`            | Add item to wishlist         |
| DELETE | `/api/wishlist/items/:productId` | Remove wishlist item         |
| GET    | `/api/cart`                      | Get current cart             |
| POST   | `/api/cart/items`                | Add product to cart          |
| PUT    | `/api/cart/items/:productId`     | Update cart quantity         |
| DELETE | `/api/cart/items/:productId`     | Remove item from cart        |
| POST   | `/api/orders`                    | Create an order from cart    |
| GET    | `/api/orders/:id`                | Fetch an order               |
| POST   | `/api/payments`                  | Process payment              |

The OpenAPI contract is available in:

- `playground/openapi.yaml`

## Database Schema Highlights

The backend uses Prisma with the following major entities:

- User
- RefreshToken
- Product
- WishlistItem
- Cart
- CartItem
- Order
- OrderItem
- Payment

Important data rules:

- Users have unique emails.
- Each cart is unique per user.
- Each wishlist item is unique per user/product pair.
- Order totals are calculated on the server.
- Payments are tied to a unique order.

## Testing

Run the API test suite:

```bash
cd Book_Store_Capstone/playground
npm test
```

The project includes integration tests for:

- authentication
- products
- wishlist
- cart
- orders
- payments

## Production Readiness Checklist

Before deploying to production, verify the following:

- `.env` files are not stored in git
- strong JWT secrets are configured
- PostgreSQL is running in a managed, secure environment
- database migrations are applied in CI/CD or deployment
- Prisma client is generated during build or deployment
- app is behind HTTPS
- CORS is restricted to trusted origins
- rate limiting and audit logging are added as needed
- secrets are rotated regularly
- frontend API base URL points to the correct production backend
- monitoring and health checks are enabled

## Security Considerations

This project already implements core security basics, but production systems should extend them with:

- HTTPS enforcement
- environment-specific secret management
- strict CORS policies
- request rate limiting
- content security headers
- input sanitization and validation
- proactive dependency scanning
- log redaction for sensitive fields
- token expiry monitoring and rotation audits

## Troubleshooting

### Database connection errors

Check:

- `DATABASE_URL` is valid
- PostgreSQL is running
- database exists
- credentials are correct

### JWT errors

Check:

- `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- tokens are not expired
- refresh flow is using the correct token type

### Frontend API errors

Check:

- `NEXT_PUBLIC_API_URL` is correct
- backend server is running
- no CORS issue is blocking requests

### Prisma migration issues

Run:

```bash
npx prisma migrate status
npx prisma generate
```

## Recommended Next Steps

For a real production release, consider implementing:

- admin dashboard for inventory management
- role-based access control
- payment gateway integration (Stripe/Razorpay etc.)
- email verification and password reset
- shipping and order tracking
- customer reviews and ratings
- advanced product search and filtering
- analytics and reporting
- CI/CD pipeline with automated tests and deployment checks

## Useful Commands Summary

### Backend

```bash
npm install
npm run dev
npm start
npm test
npm run db:migrate
npm run db:generate
npm run db:seed
```

### Frontend

```bash
npm install
npm run dev
npm run build
npm run start

Capstone_Project/Bob-work/bob/frontend/bookstore$ npm run start
Capstone_Project/Bob-work/bob/playground$ npm run start
```

## Notes

This project is designed as a complete learning and demonstration bookstore application. It is structured to be extended toward production use, but the deployment layer, infrastructure hardening, and operational controls still need to be customized to your hosting environment, compliance requirements, and business needs.
