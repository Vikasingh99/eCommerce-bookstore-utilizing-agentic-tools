# AGENTS.md — Agent (Code) Mode

This file provides guidance to agents when working with code in this repository.

## Critical Coding Rules

### Never use `useState` lazy initialiser for localStorage/cookie reads
SSR executes the initialiser where `window`/`document` is undefined — the value is always `null` and never re-runs after hydration. Use `useState(null)` + `useEffect` instead. See `src/context/AuthContext.js` for the correct pattern.

### `loading` must be checked before any auth-conditional render
`AuthContext` starts with `loading: true`. Rendering auth-dependent JSX before `loading` becomes `false` causes a logged-out flash. Always guard with `{!loading && (isAuthenticated ? ... : ...)}` or use `<ProtectedRoute>`.

### Bootstrap JS is absent — use React state for all interactions
`layout.js` only imports Bootstrap CSS. `data-bs-toggle`, `data-bs-dismiss`, `data-bs-target` and all Bootstrap JS-driven components will silently do nothing. Model interactive state in React (see `Navbar.jsx` mobile menu toggle pattern).

### axiosSecure must never be imported inside AuthContext
`axiosSecure.js` imports token helpers from `AuthContext.js`. The dependency is one-way: `axiosSecure → AuthContext`. Reversing this creates a circular module dependency that silently breaks the interceptor.

### Never add `Authorization` headers manually in page/component code
The request interceptor in `axiosSecure.js` attaches `Bearer <token>` to every request automatically. Manual headers in components create double-header bugs and bypass token refresh logic.

### AppError signature: `(statusCode, errorTitle, message)` — all three args required
```js
// Correct
throw new AppError(404, 'Not Found', 'Product not found');
// Wrong — errorTitle is undefined, JSON response will have error: undefined
throw new AppError(404, 'Product not found');
```

### Cart `POST /api/cart/items` ADDS to existing quantity — does not replace
`addToCart` service accumulates: `existing.quantity + quantity`. To set an exact quantity use `PUT /api/cart/items/:productId` with `{ quantity }`.

### `POST /api/orders` — send empty body, never send price/product data
Order is assembled from the live cart server-side. Sending a body is silently ignored. The frontend must never be the source of order line items or prices.

### Zod validation is in every controller — replicate the pattern for new routes
No global validation middleware exists. Each controller does:
```js
const result = schema.safeParse(req.body);
if (!result.success) return next(new AppError(400, 'Bad Request', result.error.errors[0].message));
```

### JWT `type` field blocks cross-use of tokens
Access tokens have `type: "access"`, refresh tokens have `type: "refresh"`. The `authenticate` middleware rejects any token where `decoded.type !== 'access'`, even if the signature is valid. Never pass a refresh token to a protected endpoint.

### React Compiler is on — do not add manual `useMemo`/`useCallback`
`next.config.mjs` enables `reactCompiler: true`. The compiler auto-memoises. Manual wrappers create redundant double-memoisation and may conflict with compiler output.

### Tailwind v4 — no config file
`@tailwindcss/postcss` is the plugin. There is no `tailwind.config.js`. Do not create one. Customise via CSS custom properties in `globals.css`.

### All `npm` commands must run from their respective subdirectory
No root `package.json` exists. `frontend/bookstore/` and `playground/` are separate isolated projects.
