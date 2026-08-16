# Project WADANI — VGIS Dashboard

A single-file, fully interactive React dashboard for **PROJECT WADANI: Laascaanood
Civic Infrastructure & Volunteer Grading System (VGIS)** (North East State of
Somalia).

**Created by and copyright of Ali Suleiman Ali.**
© 2026 Ali Suleiman Ali. All rights reserved.

## What's here

- `ProjectWadaniDashboard.jsx` — the complete dashboard component (default export
  `ProjectWadaniDashboard`) for use inside a React + Tailwind + lucide-react
  project. All sub-components and formulas live in this one file.
- `dashboard-standalone.html` — the same dashboard as a **plain HTML file with
  no dependencies**. Download it and double-click to open in any browser —
  no Node, no npm install, no build step. It reimplements the same
  interactions in vanilla JS/CSS (no React or lucide-react, so it stays a
  single file you can just open).
- **[`../../backend/`](../../backend/)** — the Express + PostgreSQL API both
  of the above talk to for volunteers, attendance, and admin login. Both
  frontends are static files that call this backend over HTTP; neither one
  stores volunteer/attendance data itself anymore.

## Run it

The dashboard needs the backend deployed (or running locally) to load
volunteers, register people, or mark attendance — the tables in the Town
Hall / Projects / VGIS Calculator / Integrity tabs are static demo content
and work with no backend at all, but Registry and Attendance are now
backed by a real shared database.

1. Deploy the backend — see **[`backend/README.md`](../../backend/README.md)**
   (free, ~10 minutes on Render).
2. Open `dashboard-standalone.html` (or `ProjectWadaniDashboard.jsx`) and set
   the `API_BASE_URL` constant near the top of the script to your deployed
   backend's URL.
3. Open the HTML file in a browser (double-click it, or `open
   dashboard-standalone.html` / `xdg-open dashboard-standalone.html`), or
   deploy it as a static site (e.g. GitHub Pages).

Running the standalone HTML file straight from disk (`file://`) works fine
as long as the backend's `CORS_ORIGIN` allows it — see the backend README.

## Sections

1. **Global Diaspora Town Hall & Micro-Donation Engine** — remittance comparison,
   an interactive pledge/donor calculator (annual pool, 1:1 match, km funded),
   and a donation action panel (USSD `*880#`, Dahabshiil/Taaj, Swift wire).
2. **Unified Volunteer Profiling & Registry Engine** — filterable volunteer
   table across the five contributor categories, full VGIS profile panel, and
   a "New Registration" intake modal capturing name, phone, district/site,
   category, contribution modality, hours/quantity, and $ value. New
   registrations start as **Pending Verification** until an admin verifies them.
3. **Attendance** — a daily roster of every volunteer with Present/Late/Absent
   marking, live today's-attendance stats, and a running attendance history
   log. Marking attendance requires an admin login.
4. **VGIS Core Calculator & Government Procurement Simulator** — the official
   economic valuation baseline grid, plus a live tender-scoring simulator
   (`Total Score = 0.70 × Tech/Fin + 0.30 × [Bidder VGIS / Max VGIS] × 100`)
   with tie-breaker logic.
5. **Phase-1 Priority Projects Tracker** — progress bars and division-of-labor
   breakdowns for the Airport Rehabilitation and Laascaanood–Kalabaydh Highway
   Corridor sub-projects, plus a Hobbs-meter fleet tracker.
6. **Integrity Code, Audit & Anti-Fraud Engine** — the Class A/B/C offense
   matrix, an interactive NOV & appeals workflow diagram, and a live fraud
   alert simulator (`Points Deducted = Claimed Points × Penalty Multiplier`).

## Admin login

Both the React component and the standalone HTML file include an admin
login (top-right of the header). Verifying a pending registration and
marking attendance both require being logged in. Credentials are checked
by the backend against a bcrypt-hashed password in Postgres — the frontend
no longer contains any password.

| Username   | Password    | Role         |
|------------|-------------|--------------|
| `alibarre` | `571barre`  | Super Admin  |

Change this by editing `ADMINS` in `backend/src/seed.js` and redeploying
the backend (see `backend/README.md`) — the seed script is idempotent, so
re-running it updates the existing account rather than duplicating it.

## Data persistence

Volunteers and attendance records live in the backend's PostgreSQL
database — shared across every visitor, not per-browser. The only thing
the frontend still keeps in `localStorage` is the signed-in admin's login
token, so a page reload doesn't force a re-login; that token is validated
against the backend (`GET /api/auth/me`) on every load, not trusted blindly.

If the backend is unreachable (not yet deployed, wrong `API_BASE_URL`,
CORS misconfigured), the dashboard shows a red banner explaining what's
wrong instead of failing silently.

## Using it in your app

Requires React 18+, [`lucide-react`](https://lucide.dev/), and Tailwind CSS
already configured in the host project (the component uses plain Tailwind
utility classes, including bracket arbitrary-value colors like `bg-[#0F172A]`,
so no `tailwind.config` changes are needed).

```bash
npm install lucide-react
```

```jsx
import ProjectWadaniDashboard from "./dashboards/project-wadani-vgis/ProjectWadaniDashboard";

export default function App() {
  return <ProjectWadaniDashboard />;
}
```

Set `API_BASE_URL` near the top of `ProjectWadaniDashboard.jsx` to your
deployed backend's URL (see `backend/README.md`) before using this in
production — it defaults to a placeholder Render URL that won't exist
until you deploy your own.
