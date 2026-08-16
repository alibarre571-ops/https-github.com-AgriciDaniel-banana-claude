# Project WADANI VGIS — Backend

An Express + PostgreSQL API backing the [Project WADANI VGIS dashboard](../dashboards/project-wadani-vgis/).
Replaces the dashboard's old browser-`localStorage` data layer with a real,
shared database and password-hashed admin authentication.

## What it does

- **Auth** — `POST /api/auth/login` checks username/password against the
  `admins` table (bcrypt-hashed passwords) and returns a signed JWT.
  `GET /api/auth/me` validates a token (used to restore a session on reload).
- **Volunteers** — `GET /api/volunteers` (public), `POST /api/volunteers`
  (public registration, starts as `Pending Verification`), `PATCH
  /api/volunteers/:id/verify` (admin-only).
- **Attendance** — `GET /api/attendance` (public), `POST /api/attendance`
  (admin-only; upserts one record per volunteer per day).

All writes that matter (verifying a registration, marking attendance)
require a valid `Authorization: Bearer <token>` header from `/api/auth/login`.

## Deploy it (Render, free tier, ~10 minutes)

This repo includes a `render.yaml` Blueprint at the repo root that
provisions both the web service and a free Postgres database in one step,
and wires them together automatically.

1. Go to [render.com](https://render.com) and sign up / log in (free).
2. **New** → **Blueprint**, connect this GitHub repository, pick the branch.
3. Render reads `render.yaml`, shows you the `wadani-vgis-backend` web
   service and `wadani-vgis-db` database it's about to create. Click
   **Apply**.
4. Wait for the build to finish (installs deps, runs `npm run migrate` then
   `npm run seed` automatically — both are safe to re-run on every deploy).
5. Once live, copy the service's URL from the Render dashboard (something
   like `https://wadani-vgis-backend.onrender.com`).
6. Open `dashboards/project-wadani-vgis/dashboard-standalone.html` (and/or
   `ProjectWadaniDashboard.jsx`) and set `API_BASE_URL` near the top of the
   script to that URL, then redeploy the frontend (GitHub Pages / wherever
   it's hosted).

Free-tier Render web services spin down after 15 minutes of inactivity and
take ~30-60s to wake back up on the next request — expect a slow first load
after idle periods. The free Postgres database is fine for this dashboard's
scale but is deleted after 90 days on Render's free plan unless upgraded;
back up data (`pg_dump`) if that matters to you.

### CORS

`render.yaml` sets `CORS_ORIGIN=*` by default so any frontend can call the
API while you're getting set up. Once you know your frontend's real URL
(e.g. `https://alibarre571-ops.github.io`), tighten this: in the Render
dashboard, set the `CORS_ORIGIN` environment variable to that exact origin
(comma-separate multiple origins) and redeploy.

## Local development

Requires a local PostgreSQL instance.

```bash
cd backend
npm install
cp .env.example .env   # edit DATABASE_URL / JWT_SECRET if needed
npm run migrate        # creates tables
npm run seed            # seeds the admin account + demo volunteers
npm run dev              # starts the API on http://localhost:4000
```

## Environment variables

| Variable       | Required | Notes                                                              |
|----------------|----------|----------------------------------------------------------------------|
| `DATABASE_URL` | yes      | Postgres connection string. Render provides this automatically.      |
| `JWT_SECRET`   | yes      | Long random string signing login tokens. Render generates one for you.|
| `CORS_ORIGIN`  | no       | Comma-separated allowed origins, or `*`. Defaults to `*`.             |
| `PORT`         | no       | Defaults to `4000` locally; Render sets this itself.                  |

## Admin account

Seeded from `src/seed.js`:

| Username   | Password    | Role         |
|------------|-------------|--------------|
| `alibarre` | `571barre`  | Super Admin  |

To add more admins or change this password, edit the `ADMINS` array in
`src/seed.js` and re-run `npm run seed` (or `git push` to trigger a Render
redeploy, which re-runs it automatically) — it's idempotent and will update
the existing row rather than duplicate it.
