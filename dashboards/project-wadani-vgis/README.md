# Project WADANI — VGIS Dashboard

A single-file, fully interactive React dashboard for **PROJECT WADANI: Laascaanood
Civic Infrastructure & Volunteer Grading System (VGIS)** (North East State of
Somalia).

## What's here

- `ProjectWadaniDashboard.jsx` — the complete dashboard component (default export
  `ProjectWadaniDashboard`). No other files are required; all sub-components,
  seed data, and formulas live in this one file.

## Sections

1. **Global Diaspora Town Hall & Micro-Donation Engine** — remittance comparison,
   an interactive pledge/donor calculator (annual pool, 1:1 match, km funded),
   and a donation action panel (USSD `*880#`, Dahabshiil/Taaj, Swift wire).
2. **Unified Volunteer Profiling & Registry Engine** — filterable volunteer
   table across the five contributor categories, full VGIS profile panel, and
   a "New Registration" intake modal.
3. **VGIS Core Calculator & Government Procurement Simulator** — the official
   economic valuation baseline grid, plus a live tender-scoring simulator
   (`Total Score = 0.70 × Tech/Fin + 0.30 × [Bidder VGIS / Max VGIS] × 100`)
   with tie-breaker logic.
4. **Phase-1 Priority Projects Tracker** — progress bars and division-of-labor
   breakdowns for the Airport Rehabilitation and Laascaanood–Kalabaydh Highway
   Corridor sub-projects, plus a Hobbs-meter fleet tracker.
5. **Integrity Code, Audit & Anti-Fraud Engine** — the Class A/B/C offense
   matrix, an interactive NOV & appeals workflow diagram, and a live fraud
   alert simulator (`Points Deducted = Claimed Points × Penalty Multiplier`).

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

All data (volunteer registry, fleet tracker, header metrics) is seeded
in-memory via `useState` for demonstration — wire it to a real API by
replacing the `SEED_VOLUNTEERS`/`FLEET` constants and the intake modal's
`onSubmit` handler with your backend calls.
