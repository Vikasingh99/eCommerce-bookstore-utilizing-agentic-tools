# AGENTS.md

This file provides guidance to agents when working with code in this repository.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## Project Layout

```
Capstone_Project/Bob-work/bob/.bob/
├── frontend/bookstore/   ← Next.js 16 frontend (run commands HERE)
└── playground/           ← Express backend (run commands HERE)
```

All `npm` commands must be run from their respective subdirectory. Running from the repo root will fail — there is no root `package.json`.

---

## Commands

### Frontend (`frontend/bookstore/`)
```bash
npm run dev       # dev server on :3001 (backend occupies :3000)
npm run build     # production build — must pass before committing
npm run lint      # eslint with eslint-config-next/core-web-vitals
```

### Backend (`playground/`)
```bash
npm run dev                  # nodemon on :3000
npm test                     # ALL tests (jest --runInBand --forceExit)
npx jest tests/cart.test.js  # single test file
npx jest -t "GET /api/cart"  # single test by name
npx prisma migrate deploy    # apply migrations (must run before tests on fresh DB)
node prisma/seed.js          # seed 10 books (required for getTestProduct() in tests)
```

> **Tests require a live PostgreSQL DB.** The DB must be migrated AND seeded before running any test — `getTestProduct()` in `tests/helpers.js` calls `prisma.product.findFirst` directly (not mocked).

---

## Frontend — Non-Obvious Patterns

### Auth hydration rule (CRITICAL)
`AuthContext` initialises `user` as `null` with `loading: true`. A `useEffect` resolves the real user from `localStorage` after hydration. **Never use a `useState` lazy initialiser** (e.g. `useState(getTokenFromStorage)`) — it runs during SSR where `window` is `undefined` and the state never updates.

### `loading` guard in every auth-aware component
Check `loading` from `useAuth()` before rendering any auth-dependent UI. Skipping this causes a flash of logged-out state on page refresh. `ProtectedRoute` already handles this — wrap every protected page in `<ProtectedRoute>`.

### Bootstrap JS is NOT loaded
Only `bootstrap/dist/css/bootstrap.min.css` is imported in `layout.js`. Bootstrap's collapse/modal/dropdown JS is absent. **Do not use Bootstrap's JS-dependent components** (e.g. `<nav class="navbar-collapse">` driven by `data-bs-toggle`). Use React state for all interactive toggling instead — see `Navbar.jsx` for the correct pattern.

### Alias `@/` resolves to `src/`
`jsconfig.json` maps `@/*` → `./src/*`. Always import with `@/` rather than relative paths across directory boundaries.

### Two Axios instances — strict separation
- `axiosPublic` → register, login, refresh, home (no auth header)
- `axiosSecure` → everything else (auto-attaches Bearer token via request interceptor)

Do **not** add manual `Authorization` headers in components. The interceptor in `axiosSecure.js` handles all token attachment and 401 → refresh → retry logic.

### Token helpers are exported from `AuthContext`, imported by `axiosSecure`
`getAccessToken`, `setAccessToken`, `getRefreshToken`, `removeAccessToken`, `removeRefreshToken` are all exported named functions from `src/context/AuthContext.js`. `axiosSecure.js` imports them directly. This creates a deliberate one-way dependency: services → context helpers. Never import `axiosSecure` inside `AuthContext`.

### Refresh token is in a plain JS cookie, not HttpOnly
The backend returns `refreshToken` in the JSON body. The frontend stores it via `document.cookie` (JS-readable, `SameSite=Strict`). The refresh call sends it in the **request body** as `{ refreshToken }` — not as a cookie header. The backend has no cookie-parsing middleware.

### React Compiler is enabled
`next.config.mjs` sets `reactCompiler: true`. Do not add `useMemo`/`useCallback` wrappers that the compiler already handles automatically — this causes double-memoisation.

### Tailwind v4 — no `tailwind.config.js`
Uses `@tailwindcss/postcss` plugin. There is no `tailwind.config.js`. Configuration is done via CSS variables in `globals.css` if needed. Tailwind classes work alongside Bootstrap utility classes.

---

## Backend — Non-Obvious Patterns

### All errors go through `AppError` — never throw plain errors from services
```js
throw new AppError(statusCode, 'Error Title', 'Human-readable message');
// → { error: 'Error Title', message: '...' }  (JSON response)
```
Throwing a plain `Error` bypasses the operational check and returns a generic 500.

### JWT tokens carry a `type` field (`"access"` or `"refresh"`)
The `authenticate` middleware explicitly rejects tokens where `decoded.type !== 'access'`. You cannot use a refresh token to access protected routes — the middleware will return 401 even if the JWT signature is valid.

### Cart is auto-created on first access
`getOrCreateCart(userId)` is called at the start of every cart service function. There is no separate "create cart" endpoint. A cart row is silently created if one doesn't exist.

### `POST /api/cart/items` accumulates quantity, does not replace
If the product is already in the cart, `addToCart` increments `existing.quantity + quantity`. Calling it twice with `quantity: 1` results in `quantity: 2`. Use `PUT /api/cart/items/:productId` to set an exact quantity.

### `POST /api/orders` takes no request body
The order is built entirely from the current cart. Any body sent is ignored. The frontend must not pass product/price data.

### Zod validation happens in controllers, not middleware
Each controller calls `schema.safeParse(req.body)` and calls `next(new AppError(400, ...))` on failure. There is no global validation middleware. New routes must replicate this pattern.

### `tests/helpers.js` creates real DB records — no mocking
`registerAndLogin()` hits `/api/auth/register` and `/api/auth/login` via supertest against the real Express app. `getTestProduct()` queries the live database. Tests are integration tests, not unit tests.

---

## Environment Variables

| Variable | Where | Default / Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `frontend/bookstore/.env.local` | `http://localhost:3000` — **no trailing slash** |
| `DATABASE_URL` | `playground/.env` | PostgreSQL connection string |
| `JWT_SECRET` | `playground/.env` | Required — app crashes on startup if missing |
| `JWT_REFRESH_SECRET` | `playground/.env` | Required — separate secret from access token |
| `JWT_ACCESS_EXPIRES_IN` | `playground/.env` | Defaults to `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `playground/.env` | Defaults to `7d` |

---

## Code Style

- **Backend**: CommonJS (`'use strict'`, `module.exports`, `require()`). All files start with `'use strict'`.
- **Frontend**: ES Modules (`import`/`export`). No TypeScript — `.js` and `.jsx` only.
- **All client components** require `'use client'` as the first line (before imports).
- **Naming**: `camelCase` for variables/functions, `PascalCase` for React components and class names.
- **No inline `Authorization` headers** in page components — interceptor handles it.
- **Financial values**: Never compute totals on the frontend. Backend responses are authoritative for price, stock, cart total, and order amount.
