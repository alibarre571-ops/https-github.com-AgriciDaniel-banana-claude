# Project WADANI — VGIS Dashboard

A single-file, fully interactive React dashboard for **PROJECT WADANI: Laascaanood
Civic Infrastructure & Volunteer Grading System (VGIS)** (North East State of
Somalia).

**Created by and copyright of Ali Suleiman Ali.**
© 2026 Ali Suleiman Ali. All rights reserved.

## What's here

- `ProjectWadaniDashboard.jsx` — the complete dashboard component (default export
  `ProjectWadaniDashboard`) for use inside a React + Tailwind + lucide-react
  project. All sub-components, seed data, and formulas live in this one file.
- `dashboard-standalone.html` — the same dashboard as a **plain HTML file with
  no dependencies**. Download it and double-click to open in any browser —
  no Node, no npm install, no build step, works fully offline. This is the
  fastest way to run the dashboard locally; it reimplements the same data,
  formulas, and interactions in vanilla JS/CSS (no React or lucide-react, so
  it stays a single file you can just open).

## Run it locally right now

Download `dashboard-standalone.html` and open it directly in a browser
(double-click it, or `open dashboard-standalone.html` / `xdg-open
dashboard-standalone.html`). That's it — every tab, slider, calculator, the
registration modal, and the fraud-alert simulator work with zero setup.

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

Both the React component and the standalone HTML file include a client-side
demo admin login (top-right of the header). Verifying a pending registration
and marking attendance both require being logged in.

Demo accounts:

| Username  | Password    | Role           |
|-----------|-------------|----------------|
| `admin`   | `wadani2026`| Super Admin    |
| `auditor` | `laas2026`  | Field Auditor  |

This is a **browser-side demo login only** — credentials are hard-coded in
the client bundle, not checked against a server. It's meant to demonstrate
the gating UX (who can verify registrations / mark attendance), not to
provide real authentication. Wire it to a real auth backend before using
this for anything beyond a demo.

## Data persistence

Both versions persist volunteers, attendance records, and the admin session
to the browser's `localStorage`, so registrations, verifications, and
attendance marks survive a page reload. Clearing site data / browser storage
resets the dashboard back to the seed dataset.

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

Volunteer, attendance, and admin-session state is seeded via `useState` and
persisted to `localStorage` for demonstration — wire it to a real backend by
replacing the `SEED_VOLUNTEERS`/`FLEET`/`ADMINS` constants and the
`loadJSON`/`saveJSON` calls with your API and auth calls.
