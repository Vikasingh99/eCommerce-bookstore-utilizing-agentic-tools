# AGENTS.md — Plan Mode

This file provides guidance to agents when working with code in this repository.

## Architectural Constraints (Non-Obvious)

### Auth state resolves asynchronously — all protected pages have a render gap
`AuthContext` is `loading: true` until a `useEffect` fires post-hydration. Every protected page renders `null` or a loading spinner during this window. Any plan that assumes synchronous auth state is incorrect.

### axiosSecure is a module-level singleton with shared mutable state
`isRefreshing` and `failedQueue` are module-level variables in `axiosSecure.js`. Multiple concurrent 401 responses are queued and replayed — the queue is not request-scoped. This design must be preserved; moving to a class or factory breaks the queuing.

### Refresh token rotation is DB-backed — tokens are single-use
Every refresh call revokes the used token in the `RefreshToken` table and issues a new one. Replaying a refresh token (e.g. from a cached request) returns 401. Plans that cache or retry refresh tokens will fail.

### Cart is created lazily — no explicit creation step needed
`getOrCreateCart(userId)` runs inside every cart service method. There is no `POST /api/cart` endpoint. Plans that include "initialise cart" as a step are incorrect.

### Order total is computed server-side from live product prices at time of order
`OrderItem.price` stores the price at purchase time (snapshot). The frontend never controls this value. Plans that involve sending prices from the client will be silently ignored by the backend.

### No global validation middleware — each controller owns its own Zod validation
Adding a route without replicating `schema.safeParse(req.body)` + `AppError(400, ...)` means invalid input reaches the service layer and throws an unhandled error (500). This must be in every new controller.

### Bootstrap JS is permanently absent from the frontend
`layout.js` does not and must not import Bootstrap JS (it would conflict with React hydration). Any UI interaction plan that assumes Bootstrap's JS-driven behaviour (modals, collapse, tooltips, dropdowns) cannot be implemented as-is — it must be re-planned using React state.

### `POST /api/cart/items` is additive, not idempotent
Adding the same product twice accumulates quantity. Plans involving "add to cart from wishlist" must account for this: the item may already be in the cart, resulting in doubled quantity rather than quantity=1.

### JWT access tokens expire in 15 minutes — UI must handle silent refresh
The axiosSecure interceptor handles 401 → refresh → retry transparently. Plans that show "session expired, please login" on every API failure are wrong — only show that message when the refresh itself fails.

### Two independent project roots — no shared build, CI, or test pipeline
`frontend/bookstore/` and `playground/` have completely separate dependencies, scripts, and environments. Any plan involving shared tooling, root-level scripts, or cross-project imports requires creating that infrastructure from scratch.

### Prisma `Decimal` fields serialise as strings in API JSON
`price` (Decimal 10,2) and `rating` (Decimal 3,1) arrive as `"499.00"` and `"4.8"` strings. Plans involving arithmetic or comparisons on these values must account for `parseFloat()` conversion on the frontend.
