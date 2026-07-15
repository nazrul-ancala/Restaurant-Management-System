# E2E tests (Playwright)

## Precondition

This project only auto-boots the **frontend** dev server. Postgres and the
backend must already be running and seeded before you run tests:

```
docker-compose up -d postgres
cd ../backend && npm run dev
cd ../backend && npm run db:seed   # only needed once / after a DB reset
```

`global-setup.ts` checks `GET /health` on the backend before tests run and
fails fast with a clear message if it's unreachable.

## Setup (one time)

```
npm install
npx playwright install chromium
```

## Run

```
npm test              # headless
npm run test:ui        # Playwright UI mode, good for debugging
npm run test:headed    # headed browser
npm run report         # open the last HTML report
```

## Env var overrides

- `E2E_BASE_URL` — frontend base URL (default `http://localhost:3000`)
- `E2E_BACKEND_URL` — backend health-check URL (default `http://localhost:4000/health`)
- `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` — login credentials (default the seeded admin `admin@rms.local` / `admin123`)
