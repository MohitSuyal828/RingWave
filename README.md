# RingWave — Integrated Fullstack (Frontend + Backend)

This package contains the fully wired-up frontend and backend, verified
against each other by actually running both and exercising every endpoint
with curl (register, login, refresh, logout, profile get/update, calls,
detections) plus a real CORS preflight check from a browser-equivalent
origin.

## Bugs found and fixed during this pass

Your "register shows an error" report was real — registration (and
everything else) was broken by backend packaging/wiring issues, not a
frontend problem. Three backend bugs were found and fixed:

1. **`package.json` was missing dependencies the code actually requires.**
   `server.js` and the middleware require `helmet`, `express-rate-limit`,
   and `zod`, but none of the three were listed in `backend/package.json`.
   A fresh `npm install` would never install them, and the server would
   crash on startup with `Cannot find module 'helmet'` before handling a
   single request — which is exactly the kind of failure that looks like
   "everything is broken" regardless of which endpoint you test first.
   **Fixed:** added all three to `dependencies`.

2. **CORS was never actually enabled.** `cors` was a listed dependency but
   `server.js` never called `app.use(cors())`. Without it, every request
   from a browser-based frontend on a different origin/port (e.g. Vite on
   `localhost:5183`) is blocked by the browser itself, regardless of how
   correct the API is — curl-based testing doesn't reveal this since curl
   doesn't enforce CORS. **Fixed:** added `app.use(cors({ origin: process.env.FRONTEND_URL || true }))` right after `helmet()`.

3. **`POST /auth/register` leaked the bcrypt password hash** in its
   response (`createUser`'s `RETURNING *` includes the `password` column,
   and the controller returned that row as-is). **Fixed:** the controller
   now strips `password` from the returned user object before responding.

A fourth issue was frontend-only: Postgres `DECIMAL(5,2)` columns
(`confidence_score`) come back through the `pg` driver as **strings**
(e.g. `"92.50"`), not numbers, even though the column is numeric.
**Fixed:** `detectionApi.ts` now coerces `confidence_score` to a real
`Number` right where it enters the frontend, so every downstream consumer
gets the type it expects.

Every endpoint was then re-tested end-to-end against a live Postgres
database: register, duplicate-register (409), login, wrong-password login
(401), get profile, update name, update password with wrong current
password (401), update password with correct current password (200),
re-login with old password (fails) and new password (succeeds), log a
call, fetch call history (with joined names), log a detection, fetch
detection history, refresh an access token, logout, and refresh-after-
logout (401). All of it matches the frontend's `services/api/*` exactly.

## What's integrated vs. intentionally out of scope

**Integrated (real backend calls):** Login, Register, Logout, Profile
view + edit (name & password change via `PATCH /auth/profile`), Call
History (with pagination), Detection Reports (with pagination), and the
Dashboard (stats/recent calls/recent detections/authenticity summary, all
derived from real data).

**Intentionally NOT implemented** (no corresponding backend feature —
left on mock data with an in-app banner explaining why): Contacts, Notifications,
OTP / email verification, Forgot Password, Reset Password, and the
Settings preference toggles (none of these persist anywhere server-side).
Also out of scope, as before: Socket.IO/real-time signaling and the ML
detection runtime itself — the frontend only calls the REST endpoints that
log/read detection *results*, it doesn't run any model.

## Setup

### 1. Database
```bash
createdb ringwave_db
psql -U postgres -d ringwave_db -f backend/sql_archive/000_full_schema.sql
```
(If you already have an existing `ringwave_db` with `users`,
`call_history`, `detection_logs` from your original SQL dump, just run the
`refresh_tokens` portion — see `backend/sql_archive/001_create_refresh_tokens.sql`.)

### 2. Backend
```bash
cd backend
npm install
# edit .env if your DB credentials differ from the defaults
npm start          # or: npm run dev (nodemon)
```
Verify it's up: `curl http://localhost:5000/health`

### 3. Frontend
```bash
cd frontend
npm install
# .env already points VITE_API_URL at http://localhost:5000/api/v1
npm run dev
```
Open the printed local URL and try registering an account.

### 4. Production build check
```bash
cd frontend && npm run build   # tsc + vite build, both must pass with zero errors
```
