# AGENTS.md — Ask Mode

This file provides guidance to agents when working with code in this repository.

## Project Context (Non-Obvious)

### Two completely separate Node projects — no monorepo tooling
`frontend/bookstore/` and `playground/` are standalone `package.json` projects with no shared tooling, no workspace linking, and no root scripts. Documentation that says "run from project root" means run from within each subdirectory.

### The backend runs on :3000, the frontend dev server should use a different port
`NEXT_PUBLIC_API_URL=http://localhost:3000` targets the backend. The Next.js dev server defaults to :3001 or any free port — never :3000 (already taken by Express).

### All backend tests are integration tests against a live PostgreSQL database
There are no mocks, no in-memory databases, no jest.mock() calls anywhere. `tests/helpers.js` creates real users and queries real products. The DB must be migrated (`npx prisma migrate deploy`) and seeded (`node prisma/seed.js`) before tests can pass.

### The refresh token is NOT in an HttpOnly cookie
It is stored in a plain `document.cookie` string set from JavaScript (`SameSite=Strict`, 7-day `max-age`). It is sent in the request JSON body `{ refreshToken }` to `POST /api/auth/refresh` — not via `Cookie:` header. The backend has no `cookie-parser` middleware.

### AuthContext's `loading` state is the source of truth for hydration completion
Any component that reads `isAuthenticated` without first checking `loading === false` will incorrectly behave as if the user is logged out on page refresh. This is because `user` starts as `null` and is only set after the `useEffect` post-hydration check.

### Bootstrap utility classes and Tailwind classes coexist in the same JSX
`layout.js` imports Bootstrap CSS globally. Components freely mix `className="d-flex container"` (Bootstrap) with Tailwind utilities. There is no conflict resolution needed — they target different class names by convention.

### `@/` is `src/` — the only path alias in the project
`jsconfig.json` defines a single alias: `@/*` → `./src/*`. There are no other aliases. Any import that starts with `@/` resolves relative to `frontend/bookstore/src/`.

### Product `price` and `rating` come back as strings from the API
Prisma serialises `Decimal` fields as strings. `parseFloat(product.price)` is needed before arithmetic. The frontend must never pass these string values directly into calculations without parsing.

### `CLAUDE.md` in the frontend root simply re-exports `@AGENTS.md`
It contains only `@AGENTS.md` and adds no additional rules. The canonical AI guidance file is `AGENTS.md` in the same directory.
