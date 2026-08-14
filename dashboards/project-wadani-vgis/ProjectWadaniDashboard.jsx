import React, { useEffect, useMemo, useState } from "react";
import {
  Landmark,
  Users,
  Route,
  Plane,
  Globe2,
  HandCoins,
  Calculator,
  ClipboardList,
  ShieldAlert,
  X,
  Plus,
  Search,
  Filter,
  Smartphone,
  Wallet,
  Send,
  Award,
  Gauge,
  Truck,
  Building2,
  GraduationCap,
  Briefcase,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Gavel,
  Radio,
  FileWarning,
  Fence,
  Sun,
  Building,
  Layers,
  ChevronRight,
  TrendingUp,
  Calendar,
  Lock,
  LogOut,
  XCircle,
} from "lucide-react";

/* -------------------------------------------------------------------------
 * PROJECT WADANI — Laascaanood Civic Infrastructure & Volunteer Grading
 * System (VGIS). Single-file interactive dashboard.
 *
 * Created by and copyright of Ali Suleiman Ali.
 * © 2026 Ali Suleiman Ali. All rights reserved.
 * ---------------------------------------------------------------------- */

const NAV_TABS = [
  { id: "townhall", label: "Diaspora Town Hall", icon: Globe2 },
  { id: "registry", label: "Volunteer Registry", icon: Users },
  { id: "attendance", label: "Attendance", icon: Calendar },
  { id: "vgis", label: "VGIS Core Calculator", icon: Calculator },
  { id: "projects", label: "Priority Projects", icon: Route },
  { id: "integrity", label: "Integrity & Audit", icon: ShieldAlert },
];

const DISTRICTS = ["Laascaanood Town Centre", "Kalabaydh Corridor", "Yagoori", "Xudun Road", "Airport Perimeter", "Other"];

const CATEGORIES = [
  { id: "citizens", label: "Ordinary Citizens", icon: UserCheck },
  { id: "business", label: "Registered Businesses", icon: Briefcase },
  { id: "diaspora", label: "Diaspora Community", icon: Globe2 },
  { id: "education", label: "Educational Institutions / Students", icon: GraduationCap },
  { id: "government", label: "Government Workers / Experts", icon: Building2 },
];

const VALUATION_BASELINE = [
  { activity: "1 Hour Unskilled Labor", usd: 2.5, points: 2.5 },
  { activity: "1 Hour Skilled Trade", usd: 6.0, points: 6.0 },
  { activity: "1 Hour Civil Engineer", usd: 20.0, points: 20.0 },
  { activity: "1 Hour Heavy Machinery (Grader/Dozer)", usd: 65.0, points: 65.0 },
  { activity: "1 Trip Haulage Gravel", usd: 40.0, points: 40.0 },
  { activity: "$1 USD Cash / Micro-donation", usd: 1.0, points: 1.0 },
];

const ROAD_COST_PER_KM = 45000; // USD, DBST rural road equivalent
const RUNWAY_COST_PER_KM = 1250000; // USD, paved runway equivalent

function tierForPoints(points) {
  if (points >= 10000) return { name: "Platinum", color: "text-slate-100", bg: "bg-slate-500/20", ring: "ring-slate-300/40" };
  if (points >= 5000) return { name: "Gold", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", ring: "ring-[#F59E0B]/40" };
  if (points >= 1500) return { name: "Silver", color: "text-gray-300", bg: "bg-gray-400/10", ring: "ring-gray-300/40" };
  return { name: "Bronze", color: "text-orange-400", bg: "bg-orange-500/10", ring: "ring-orange-400/40" };
}

function fmtUSD(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtNum(n, digits = 0) {
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------- Local persistence (browser-only demo storage) ---------------- */
const STORAGE_KEYS = {
  volunteers: "wadani_vgis_volunteers_v1",
  attendance: "wadani_vgis_attendance_v1",
  session: "wadani_vgis_admin_session_v1",
};

function loadJSON(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveJSON(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* storage unavailable */
  }
}

/* ---------------- Admin accounts (client-side demo auth — not real security) ---------------- */
const ADMINS = [
  { username: "alibarre", password: "571barre", name: "Ali Suleiman Ali", role: "Super Admin" },
];

const SEED_VOLUNTEERS = [
  {
    id: "VGIS-LS-2026-0102",
    name: "Xasan Cabdi Warsame",
    category: "citizens",
    entityType: "Individual Citizen",
    modality: "Labor",
    logHistory: "42 hrs unskilled labor, box-culvert excavation, Kalabaydh corridor",
    valueUSD: 105,
    points: 105,
    phone: "+252 63 401 1102",
    district: "Kalabaydh Corridor",
    status: "Verified",
    dateRegistered: "2026-01-14",
  },
  {
    id: "VGIS-LS-2026-0087",
    name: "Golis Construction & Trading Co.",
    category: "business",
    entityType: "Registered Business",
    modality: "Equipment",
    logHistory: "1 Grader logged 60 Hobbs hrs, Kalabaydh corridor DBST works",
    valueUSD: 3900,
    points: 3900,
    phone: "+252 63 700 0087",
    district: "Kalabaydh Corridor",
    status: "Verified",
    dateRegistered: "2026-01-09",
  },
  {
    id: "VGIS-LS-2026-0451",
    name: "Sahra M. Egal (Toronto Chapter)",
    category: "diaspora",
    entityType: "Diaspora Donor",
    modality: "Cash",
    logHistory: "Monthly VGIS pledge, 14 consecutive months, USSD + Swift",
    valueUSD: 1400,
    points: 1400,
    phone: "+1 416 555 0142",
    district: "Other",
    status: "Verified",
    dateRegistered: "2025-11-02",
  },
  {
    id: "VGIS-LS-2026-0512",
    name: "Laascaanood Polytechnic — Civil Eng. Brigade",
    category: "education",
    entityType: "Educational Institution",
    modality: "Labor",
    logHistory: "310 student-hours, interlocking cobblestone paving brigades",
    valueUSD: 775,
    points: 775,
    phone: "+252 63 402 0512",
    district: "Laascaanood Town Centre",
    status: "Verified",
    dateRegistered: "2026-02-01",
  },
  {
    id: "VGIS-LS-2026-0033",
    name: "Eng. Faysal Nur Jibril",
    category: "government",
    entityType: "Government Civil Engineer",
    modality: "Expert Advisory",
    logHistory: "220 hrs airport runway leveling design & site supervision",
    valueUSD: 4400,
    points: 4400,
    phone: "+252 63 400 0033",
    district: "Airport Perimeter",
    status: "Verified",
    dateRegistered: "2025-12-11",
  },
  {
    id: "VGIS-LS-2026-0210",
    name: "Nomad Fuel & Logistics",
    category: "business",
    entityType: "Registered Business",
    modality: "Fuel",
    logHistory: "6,200L diesel donated, runway rehabilitation fleet",
    valueUSD: 8680,
    points: 8680,
    phone: "+252 63 700 0210",
    district: "Airport Perimeter",
    status: "Verified",
    dateRegistered: "2026-01-22",
  },
  {
    id: "VGIS-LS-2026-0668",
    name: "Amina H. Farah",
    category: "citizens",
    entityType: "Individual Citizen",
    modality: "Labor",
    logHistory: "18 hrs unskilled labor, security fence trenching",
    valueUSD: 45,
    points: 45,
    phone: "+252 63 401 0668",
    district: "Airport Perimeter",
    status: "Pending Verification",
    dateRegistered: "2026-03-02",
  },
  {
    id: "VGIS-LS-2026-0729",
    name: "Waqooyi Galbeed Diaspora Assoc. (Oslo)",
    category: "diaspora",
    entityType: "Diaspora Group",
    modality: "Cash",
    logHistory: "Bulk 1:1 matched sponsorship, solar night-landing lights unit",
    valueUSD: 22000,
    points: 22000,
    phone: "+47 900 55 214",
    district: "Other",
    status: "Verified",
    dateRegistered: "2025-10-18",
  },
  {
    id: "VGIS-LS-2026-0355",
    name: "Ministry of Public Works — Field Unit 3",
    category: "government",
    entityType: "Government Expert Team",
    modality: "Expert Advisory",
    logHistory: "Quality assurance inspections, 12 site audits",
    valueUSD: 2640,
    points: 2640,
    phone: "+252 63 400 0355",
    district: "Laascaanood Town Centre",
    status: "Verified",
    dateRegistered: "2025-12-29",
  },
  {
    id: "VGIS-LS-2026-0894",
    name: "SSC Youth Volunteer Corps — Batch 4",
    category: "education",
    entityType: "Student Brigade",
    modality: "Labor",
    logHistory: "540 student-hours, cobblestone & terminal grounds works",
    valueUSD: 1350,
    points: 1350,
    phone: "+252 63 402 0894",
    district: "Yagoori",
    status: "Pending Verification",
    dateRegistered: "2026-03-10",
  },
];

const FLEET = [
  { id: "BUS-004", type: "Grader", project: "Kalabaydh Corridor", hobbsHrs: 612.4, status: "Active" },
  { id: "BUS-011", type: "Dump Truck", project: "Kalabaydh Corridor", hobbsHrs: 388.1, status: "Active" },
  { id: "BUS-019", type: "Roller", project: "Kalabaydh Corridor", hobbsHrs: 204.7, status: "Idle" },
  { id: "BUS-002", type: "Dozer", project: "Airport Runway", hobbsHrs: 501.9, status: "Active" },
  { id: "BUS-027", type: "Water Bowser", project: "Airport Runway", hobbsHrs: 96.3, status: "Maintenance" },
];

const OFFENSE_CLASSES = [
  {
    cls: "Class A",
    title: "Administrative Discrepancies",
    examples: "Late log submission, minor paperwork errors, mismatched timestamps",
    penalty: "Formal warning issued",
    clawback: "0% point loss",
    color: "border-emerald-500/40 bg-emerald-500/5",
    badge: "bg-emerald-500/15 text-emerald-400",
  },
  {
    cls: "Class B",
    title: "Wilful Misrepresentation",
    examples: "Equipment idle logging, phantom rosters, inflated hours",
    penalty: "30-day to 6-month suspension",
    clawback: "3x–5x point clawback",
    color: "border-[#F59E0B]/40 bg-[#F59E0B]/5",
    badge: "bg-[#F59E0B]/15 text-[#F59E0B]",
  },
  {
    cls: "Class C",
    title: "Hobbs Meter Tampering / Bribery / System Fraud",
    examples: "Meter tampering, bribery of auditors, coordinated fraud rings",
    penalty: "Permanent procurement blacklist + criminal referral",
    clawback: "100% account wipeout",
    color: "border-red-500/40 bg-red-500/5",
    badge: "bg-red-500/15 text-red-400",
  },
];

const WORKFLOW_STEPS = [
  { step: 1, title: "Automated / Whistleblower Flag", desc: "System anomaly detection or a whistleblower report triggers an initial flag on a volunteer or contractor record.", icon: Radio },
  { step: 2, title: "Field Investigation & Escrow Lock", desc: "A field auditor is dispatched. Related VGIS points and pending disbursements are locked in escrow pending findings.", icon: Search },
  { step: 3, title: "NOV Issuance", desc: "A formal Notice of Violation (NOV) is issued to the flagged party, citing offense class and evidence.", icon: FileWarning },
  { step: 4, title: "14-Day Appeal Window", desc: "The flagged party has 14 calendar days to submit an appeal with supporting documentation.", icon: Clock },
  { step: 5, title: "Final Binding Determination", desc: "The Integrity Board issues a final, binding ruling: dismissal, clawback, suspension, or blacklist.", icon: Gavel },
];

/* -------------------------------------------------------------------------
 * Small reusable UI primitives
 * ---------------------------------------------------------------------- */

function MetricTile({ icon: Icon, label, value, accent = "text-[#F59E0B]" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 min-w-[190px]">
      <div className={`rounded-lg bg-white/5 p-2 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-gray-400">{label}</div>
        <div className="text-lg font-semibold text-white leading-tight">{value}</div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-6 border-l-4 border-[#F59E0B] pl-4">
      {eyebrow && <div className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B]">{eyebrow}</div>}
      <h2 className="text-xl md:text-2xl font-bold text-white mt-1">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400 mt-1 max-w-3xl">{subtitle}</p>}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}>
      {children}
    </div>
  );
}

function ProgressBar({ pct, colorClass = "bg-[#10B981]" }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
      <div className={`h-full rounded-full ${colorClass} transition-all duration-500`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

function LoginModal({ open, onClose, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = onLogin(username, password);
    if (!ok) {
      setError(true);
      return;
    }
    setUsername("");
    setPassword("");
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#0F172A] border border-white/15 p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-white font-semibold text-lg mb-1">
          <Lock className="h-5 w-5 text-[#F59E0B]" /> Admin Login
        </div>
        <p className="text-sm text-gray-400 mb-4">Sign in to verify registrations and mark attendance.</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            Invalid username or password.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="mt-1 w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F59E0B]"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F59E0B]"
              required
            />
          </div>
          <div className="text-[11px] text-gray-500 leading-relaxed">
            Restricted to authorized VGIS administrators. This is a client-side login check — credentials live in
            this app's source, not a server, so treat it as access gating rather than real security.
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#F59E0B] text-[#0F172A] font-semibold py-2.5 hover:bg-[#F59E0B]/90 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminControl({ adminSession, onLoginClick, onLogout }) {
  if (adminSession) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[#F59E0B]/35 bg-[#F59E0B]/10 pl-3 pr-1.5 py-1.5">
        <Lock className="h-3.5 w-3.5 text-[#F59E0B]" />
        <div className="leading-tight">
          <div className="text-xs font-bold text-white">{adminSession.name}</div>
          <div className="text-[10px] uppercase tracking-wide text-[#F59E0B]">{adminSession.role}</div>
        </div>
        <button
          onClick={onLogout}
          title="Log out"
          className="rounded-full border border-white/15 p-1.5 text-gray-400 hover:text-white hover:border-[#F59E0B]"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={onLoginClick}
      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white hover:border-[#F59E0B] hover:text-[#F59E0B] transition"
    >
      <Lock className="h-3.5 w-3.5" /> Admin Login
    </button>
  );
}

/* -------------------------------------------------------------------------
 * TAB 1 — Global Diaspora Town Hall & Micro-Donation Engine
 * ---------------------------------------------------------------------- */

function TownHallTab() {
  const [pledgeOption, setPledgeOption] = useState(25);
  const [customPledge, setCustomPledge] = useState("");
  const [donors, setDonors] = useState(8000);

  const monthlyPledge = pledgeOption === "custom" ? Number(customPledge) || 0 : pledgeOption;

  const { annualPool, matchedPool, roadKm, runwayKm } = useMemo(() => {
    const annual = monthlyPledge * 12 * donors;
    const matched = annual * 2; // 1:1 matching multiplier
    return {
      annualPool: annual,
      matchedPool: matched,
      roadKm: matched / ROAD_COST_PER_KM,
      runwayKm: matched / RUNWAY_COST_PER_KM,
    };
  }, [monthlyPledge, donors]);

  const pledgeOptions = [5, 25, 50, 100, "custom"];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-[#F59E0B]/30 p-6 md:p-8">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B] mb-2">
          VGIS Micro-Donation & Sponsorship Framework
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Global Diaspora Town Hall &amp; VGIS Sponsorship Model
        </h1>
        <p className="text-gray-400 mt-2 max-w-3xl text-sm md:text-base">
          Converting scattered diaspora remittances into a pooled, 1:1-matched capital
          engine for Laascaanood's Phase-1 civic infrastructure.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card className="border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 font-semibold mb-3">
            <Send className="h-4 w-4" /> Traditional 1-to-1 Remittances
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• High transaction friction &amp; per-transfer fees</li>
            <li>• Funds absorbed into individual household consumer spending</li>
            <li>• No pooling — zero collective bargaining or matching power</li>
            <li>• No traceability into public infrastructure outcomes</li>
          </ul>
        </Card>
        <Card className="border-emerald-500/30">
          <div className="flex items-center gap-2 text-[#10B981] font-semibold mb-3">
            <HandCoins className="h-4 w-4" /> VGIS Collective Capital
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Pooled diaspora capital, aggregated monthly</li>
            <li>• 1:1 institutional / partner matching multiplier</li>
            <li>• Ring-fenced for Phase-1 infrastructure disbursement only</li>
            <li>• Full VGIS ledger traceability, per-km funding attribution</li>
          </ul>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 text-white font-semibold text-lg mb-1">
          <Calculator className="h-5 w-5 text-[#F59E0B]" /> Interactive Micro-Donation Calculator
        </div>
        <p className="text-sm text-gray-400 mb-5">Model the collective capital pool generated by the diaspora base.</p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-300 mb-2 font-medium">Monthly Pledge per Donor</div>
              <div className="flex flex-wrap gap-2">
                {pledgeOptions.map((opt) => (
                  <button
                    key={String(opt)}
                    onClick={() => setPledgeOption(opt)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                      pledgeOption === opt
                        ? "bg-[#F59E0B] text-[#0F172A] border-[#F59E0B]"
                        : "border-white/15 text-gray-300 hover:border-[#F59E0B]/50"
                    }`}
                  >
                    {opt === "custom" ? "Custom" : `$${opt}`}
                  </button>
                ))}
              </div>
              {pledgeOption === "custom" && (
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Enter custom monthly pledge ($)"
                  value={customPledge}
                  onChange={(e) => setCustomPledge(e.target.value)}
                  className="mt-3 w-full rounded-lg bg-[#0F172A] border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F59E0B]"
                />
              )}
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-2 font-medium">
                <span>Number of Diaspora Donors</span>
                <span className="text-[#F59E0B] font-semibold">{fmtNum(donors)}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={50000}
                step={500}
                value={donors}
                onChange={(e) => setDonors(Number(e.target.value))}
                className="w-full accent-[#F59E0B]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1,000</span>
                <span>50,000</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 content-start">
            <div className="rounded-xl bg-[#0F172A] border border-white/10 p-4 col-span-2">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Annual Capital Pool Generated</div>
              <div className="text-2xl font-bold text-white mt-1">{fmtUSD(annualPool)}</div>
            </div>
            <div className="rounded-xl bg-[#0F172A] border border-emerald-500/30 p-4 col-span-2">
              <div className="text-xs text-gray-400 uppercase tracking-wide">1:1 Matched Value (Total Deployable)</div>
              <div className="text-2xl font-bold text-[#10B981] mt-1">{fmtUSD(matchedPool)}</div>
            </div>
            <div className="rounded-xl bg-[#0F172A] border border-white/10 p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Km of Road Funded</div>
              <div className="text-xl font-bold text-[#F59E0B] mt-1">{fmtNum(roadKm, 1)} km</div>
            </div>
            <div className="rounded-xl bg-[#0F172A] border border-white/10 p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Km of Runway Funded</div>
              <div className="text-xl font-bold text-[#F59E0B] mt-1">{fmtNum(runwayKm, 2)} km</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-white font-semibold text-lg mb-4">Donation Action Panel</div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 p-4 flex gap-3">
            <Smartphone className="h-5 w-5 text-[#F59E0B] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-white">USSD</div>
              <div className="text-xs text-gray-400 mt-1">Dial <span className="text-[#F59E0B] font-mono">*880#</span> from any Somali carrier and follow the VGIS pledge menu.</div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 p-4 flex gap-3">
            <Wallet className="h-5 w-5 text-[#F59E0B] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-white">Mobile Money</div>
              <div className="text-xs text-gray-400 mt-1">Dahabshiil eDahab &amp; Taaj — Merchant code <span className="text-[#F59E0B] font-mono">VGIS-LAS-01</span>.</div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 p-4 flex gap-3">
            <Landmark className="h-5 w-5 text-[#F59E0B] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-white">Swift Wire</div>
              <div className="text-xs text-gray-400 mt-1">Institutional / bulk sponsorship transfers via SWIFT to the VGIS Capital Escrow Account.</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * TAB 2 — Unified Volunteer Profiling & Registry Engine
 * ---------------------------------------------------------------------- */

function IntakeModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    district: DISTRICTS[0],
    category: "citizens",
    entityType: "",
    modality: "Labor",
    quantity: "",
    unitValue: "",
  });

  if (!open) return null;

  const estimatedValue = (Number(form.quantity) || 0) * (Number(form.unitValue) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      id: `VGIS-LS-2026-${Math.floor(1000 + Math.random() * 8999)}`,
      name: form.name,
      category: form.category,
      entityType: form.entityType || CATEGORIES.find((c) => c.id === form.category)?.label,
      modality: form.modality,
      logHistory: `Self-registered: ${form.quantity || 0} ${form.modality === "Labor" ? "hrs" : "units"} pending field verification`,
      valueUSD: estimatedValue,
      points: estimatedValue,
      phone: form.phone.trim(),
      district: form.district,
      status: "Pending Verification",
      dateRegistered: todayStr(),
    });
    setForm({ name: "", phone: "", district: DISTRICTS[0], category: "citizens", entityType: "", modality: "Labor", quantity: "", unitValue: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#0F172A] border border-white/15 p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-white font-semibold text-lg mb-1">
          <Plus className="h-5 w-5 text-[#F59E0B]" /> New VGIS Registration
        </div>
        <p className="text-sm text-gray-400 mb-5">Register assets, machinery hours, labor, or micro-pledges.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">Full Name / Entity Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F59E0B]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+252 63 xxx xxxx"
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">District / Site Location</label>
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F59E0B]"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d} className="bg-[#0F172A]">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F59E0B]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0F172A]">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Contribution Modality</label>
              <select
                value={form.modality}
                onChange={(e) => setForm({ ...form, modality: e.target.value })}
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F59E0B]"
              >
                {["Labor", "Equipment", "Fuel", "Cash", "Expert Advisory"].map((m) => (
                  <option key={m} value={m} className="bg-[#0F172A]">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">
                {form.modality === "Labor" || form.modality === "Expert Advisory" ? "Hours" : "Quantity / Units"}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">$ Value per Unit</label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.unitValue}
                onChange={(e) => setForm({ ...form, unitValue: e.target.value })}
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
          </div>

          <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 flex justify-between items-center text-sm">
            <span className="text-gray-400">Estimated Economic Value / VGIS Points</span>
            <span className="text-[#F59E0B] font-semibold">{fmtUSD(estimatedValue)} · {fmtNum(estimatedValue, 1)} pts</span>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#F59E0B] text-[#0F172A] font-semibold py-2.5 hover:bg-[#F59E0B]/90 transition"
          >
            Submit Registration for Field Verification
          </button>
        </form>
      </div>
    </div>
  );
}

function RegistryTab({ volunteers, isAdmin, onRegister, onVerify }) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(volunteers[0]?.id);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = volunteers.filter((v) => {
    const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
    const matchesSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.id.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selected = volunteers.find((v) => v.id === selectedId) || filtered[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="VGIS Registry Engine"
        title="Unified Volunteer Profiling & Registry"
        subtitle="Every citizen, business, diaspora donor, institution, and government expert contributing to Project WADANI is logged under a single verified VGIS profile."
      />

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              categoryFilter === "all"
                ? "bg-[#F59E0B] text-[#0F172A] border-[#F59E0B]"
                : "border-white/15 text-gray-300 hover:border-[#F59E0B]/50"
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                categoryFilter === c.id
                  ? "bg-[#F59E0B] text-[#0F172A] border-[#F59E0B]"
                  : "border-white/15 text-gray-300 hover:border-[#F59E0B]/50"
              }`}
            >
              <c.icon className="h-3.5 w-3.5" /> {c.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#10B981] text-[#0F172A] px-4 py-2 text-sm font-semibold hover:bg-[#10B981]/90 transition"
        >
          <Plus className="h-4 w-4" /> New Registration
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or System ID…"
          className="w-full md:w-96 rounded-lg bg-white/5 border border-white/15 pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-white/10">
                <th className="px-4 py-3">System ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Modality</th>
                <th className="px-4 py-3 text-right">Value ($)</th>
                <th className="px-4 py-3 text-right">Status</th>
                <th className="px-4 py-3 text-right">Tier</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const tier = tierForPoints(v.points);
                const verified = v.status === "Verified";
                return (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className={`cursor-pointer border-b border-white/5 hover:bg-white/[0.04] transition ${
                      selected?.id === v.id ? "bg-white/[0.06]" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{v.id}</td>
                    <td className="px-4 py-3 text-white font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-gray-300">{v.modality}</td>
                    <td className="px-4 py-3 text-right text-gray-200">{fmtUSD(v.valueUSD)}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          verified ? "bg-[#10B981]/15 text-[#10B981]" : "bg-gray-500/15 text-gray-300"
                        }`}
                      >
                        {verified ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />} {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${tier.bg} ${tier.color}`}>
                        <Award className="h-3 w-3" /> {tier.name}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No records match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card>
          {selected ? (
            <div>
              <div className="text-xs font-mono text-gray-500">{selected.id}</div>
              <div className="text-lg font-bold text-white mt-1">{selected.name}</div>
              <div className="text-xs text-[#F59E0B] font-semibold mt-0.5">{selected.entityType}</div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-gray-400">Registration Status</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      selected.status === "Verified" ? "bg-[#10B981]/15 text-[#10B981]" : "bg-gray-500/15 text-gray-300"
                    }`}
                  >
                    {selected.status === "Verified" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />} {selected.status}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Phone</span>
                  <span className="text-white font-mono text-xs">{selected.phone || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">District / Site</span>
                  <span className="text-white font-medium">{selected.district || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Date Registered</span>
                  <span className="text-white font-medium">{selected.dateRegistered || "—"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Contribution Modality</span>
                  <span className="text-white font-medium">{selected.modality}</span>
                </div>
                <div className="border-b border-white/5 pb-2">
                  <div className="text-gray-400 mb-1">Verified Log History &amp; Output</div>
                  <div className="text-gray-200 text-xs leading-relaxed">{selected.logHistory}</div>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Economic Value Equivalent</span>
                  <span className="text-[#10B981] font-semibold">{fmtUSD(selected.valueUSD)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">VGIS Points Earned</span>
                  <span className="text-white font-semibold">{fmtNum(selected.points, 1)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-400">Dynamic Tier Grade</span>
                  {(() => {
                    const tier = tierForPoints(selected.points);
                    return (
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${tier.bg} ${tier.color} ${tier.ring}`}>
                        <Award className="h-3.5 w-3.5" /> {tier.name}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {selected.status !== "Verified" &&
                (isAdmin ? (
                  <button
                    onClick={() => onVerify(selected.id)}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-[#10B981] text-[#062019] font-semibold py-2.5 hover:bg-[#10B981]/90 transition"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Verify Registration
                  </button>
                ) : (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-2.5 text-xs text-gray-500">
                    <Lock className="h-3.5 w-3.5" /> Admin login required to verify this record
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Select a record to view its full VGIS profile.</div>
          )}
        </Card>
      </div>

      <IntakeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(newVolunteer) => {
          onRegister(newVolunteer);
          setSelectedId(newVolunteer.id);
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------
 * TAB — Daily Attendance & Presence Tracking
 * ---------------------------------------------------------------------- */

function AttendanceTab({ volunteers, attendance, isAdmin, onMark }) {
  const today = todayStr();
  const todays = attendance.filter((a) => a.date === today);
  const present = todays.filter((a) => a.status === "Present").length;
  const late = todays.filter((a) => a.status === "Late").length;
  const absent = todays.filter((a) => a.status === "Absent").length;

  const recordFor = (volunteerId) => todays.find((a) => a.volunteerId === volunteerId);
  const history = attendance.slice(0, 20);

  const statusStyle = {
    Present: { bg: "bg-[#10B981]/15", color: "text-[#10B981]", icon: CheckCircle2 },
    Late: { bg: "bg-[#F59E0B]/15", color: "text-[#F59E0B]", icon: Clock },
    Absent: { bg: "bg-red-500/15", color: "text-red-400", icon: XCircle },
    "Not Marked": { bg: "bg-gray-500/10", color: "text-gray-500", icon: null },
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Field Verification Log"
        title="Daily Attendance & Presence Tracking"
        subtitle="Admins mark daily presence for registered volunteers, contractors, and field teams. Attendance builds the verified log history behind each VGIS profile."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total Volunteers</div>
          <div className="text-2xl font-bold text-white mt-1">{fmtNum(volunteers.length)}</div>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-emerald-500/30 p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Present Today</div>
          <div className="text-2xl font-bold text-[#10B981] mt-1">{fmtNum(present)}</div>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-[#F59E0B]/30 p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Late Today</div>
          <div className="text-2xl font-bold text-[#F59E0B] mt-1">{fmtNum(late)}</div>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-red-500/30 p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide">Absent Today</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{fmtNum(absent)}</div>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 text-white font-semibold text-lg">
            <Calendar className="h-5 w-5 text-[#F59E0B]" /> Today's Roster — {today}
          </div>
          {!isAdmin && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Lock className="h-3 w-3" /> Log in as an admin to mark attendance
            </div>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-white/10">
              <th className="py-2 pr-4">Volunteer</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Modality</th>
              <th className="py-2 pr-4 text-right">Today's Status</th>
              <th className="py-2 text-right">Mark</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((v) => {
              const rec = recordFor(v.id);
              const status = rec ? rec.status : "Not Marked";
              const s = statusStyle[status];
              const catLabel = CATEGORIES.find((c) => c.id === v.category)?.label || v.category;
              return (
                <tr key={v.id} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 text-white font-medium">{v.name}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{catLabel}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{v.modality}</td>
                  <td className="py-2.5 pr-4 text-right">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${s.bg} ${s.color}`}>
                      {s.icon && <s.icon className="h-3 w-3" />} {status}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex justify-end gap-1.5 flex-wrap">
                      <button
                        disabled={!isAdmin}
                        onClick={() => onMark(v.id, v.name, "Present")}
                        className="flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 hover:border-[#10B981] hover:text-[#10B981] disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Present
                      </button>
                      <button
                        disabled={!isAdmin}
                        onClick={() => onMark(v.id, v.name, "Late")}
                        className="flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 hover:border-[#F59E0B] hover:text-[#F59E0B] disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <Clock className="h-3 w-3" /> Late
                      </button>
                      <button
                        disabled={!isAdmin}
                        onClick={() => onMark(v.id, v.name, "Absent")}
                        className="flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 hover:border-red-400 hover:text-red-400 disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <XCircle className="h-3 w-3" /> Absent
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-white font-semibold text-lg mb-4">
          <ClipboardList className="h-5 w-5 text-[#F59E0B]" /> Attendance History Log
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {history.length === 0 && <div className="text-xs text-gray-600 italic">No attendance marked yet.</div>}
          {history.map((a) => {
            const s = statusStyle[a.status];
            return (
              <div key={a.id} className="flex items-start gap-2 rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-xs">
                {s.icon && <s.icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${s.color}`} />}
                <div>
                  <div className="text-gray-300">
                    <span className="text-white font-medium">{a.volunteerName}</span> — {a.date} · {a.time}
                  </div>
                  <div className="text-gray-500">
                    Marked <span className={`font-semibold ${s.color}`}>{a.status}</span> by {a.markedBy}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * TAB 3 — VGIS Core Calculator & Government Procurement Simulator
 * ---------------------------------------------------------------------- */

function ProcurementSimulator() {
  const [techFin, setTechFin] = useState(78);
  const [bidderVGIS, setBidderVGIS] = useState(9500);
  const [competitorTechFin, setCompetitorTechFin] = useState(78);
  const [competitorVGIS, setCompetitorVGIS] = useState(6200);

  const maxVGIS = Math.max(bidderVGIS, competitorVGIS, 1);

  const bidderScore = 0.7 * techFin + 0.3 * (bidderVGIS / maxVGIS) * 100;
  const competitorScore = 0.7 * competitorTechFin + 0.3 * (competitorVGIS / maxVGIS) * 100;

  const isTechTie = techFin === competitorTechFin;
  const winner = bidderScore === competitorScore ? "tie" : bidderScore > competitorScore ? "bidder" : "competitor";

  return (
    <Card>
      <div className="flex items-center gap-2 text-white font-semibold text-lg mb-1">
        <Gauge className="h-5 w-5 text-[#F59E0B]" /> Government Tender Procurement Score Simulator
      </div>
      <p className="text-sm text-gray-400 mb-5">
        Total Score = (0.70 × Tech/Fin Score) + (0.30 × [Bidder VGIS ÷ Max VGIS] × 100)
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#F59E0B]">Bidder Under Evaluation</div>
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Technical / Financial Bid Score</span>
              <span className="text-white font-semibold">{techFin}</span>
            </div>
            <input type="range" min={0} max={100} value={techFin} onChange={(e) => setTechFin(Number(e.target.value))} className="w-full accent-[#F59E0B]" />
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Bidder's VGIS Point Balance</span>
              <span className="text-white font-semibold">{fmtNum(bidderVGIS)}</span>
            </div>
            <input type="range" min={0} max={25000} step={100} value={bidderVGIS} onChange={(e) => setBidderVGIS(Number(e.target.value))} className="w-full accent-[#F59E0B]" />
          </div>

          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 pt-2">Highest Competitor</div>
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Competitor Technical / Financial Score</span>
              <span className="text-white font-semibold">{competitorTechFin}</span>
            </div>
            <input type="range" min={0} max={100} value={competitorTechFin} onChange={(e) => setCompetitorTechFin(Number(e.target.value))} className="w-full accent-gray-400" />
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Highest Competitor VGIS Balance</span>
              <span className="text-white font-semibold">{fmtNum(competitorVGIS)}</span>
            </div>
            <input type="range" min={0} max={25000} step={100} value={competitorVGIS} onChange={(e) => setCompetitorVGIS(Number(e.target.value))} className="w-full accent-gray-400" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-[#0F172A] border border-[#F59E0B]/30 p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Bidder Total Score</div>
            <div className="text-3xl font-bold text-[#F59E0B] mt-1">{bidderScore.toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-[#0F172A] border border-white/10 p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Competitor Total Score</div>
            <div className="text-3xl font-bold text-gray-300 mt-1">{competitorScore.toFixed(2)}</div>
          </div>

          <div
            className={`rounded-xl border p-4 flex items-start gap-3 ${
              isTechTie ? "border-[#F59E0B]/50 bg-[#F59E0B]/10" : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <TrendingUp className={`h-5 w-5 shrink-0 mt-0.5 ${isTechTie ? "text-[#F59E0B]" : "text-gray-500"}`} />
            <div className="text-sm">
              {isTechTie ? (
                <>
                  <div className="font-semibold text-[#F59E0B]">Tie-Breaker Triggered</div>
                  <div className="text-gray-300 mt-1">
                    Technical/Financial scores are tied. Contract is automatically awarded on VGIS balance:{" "}
                    <span className="font-semibold text-white">
                      {bidderVGIS === competitorVGIS ? "Absolute tie — manual review required" : bidderVGIS > competitorVGIS ? "Bidder wins on higher VGIS balance" : "Competitor wins on higher VGIS balance"}
                    </span>
                    .
                  </div>
                </>
              ) : (
                <>
                  <div className="font-semibold text-white">
                    {winner === "bidder" ? "Bidder leads on combined score" : "Competitor leads on combined score"}
                  </div>
                  <div className="text-gray-400 mt-1">No tie-breaker needed — award follows the higher Total Score.</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function VGISCalculatorTab() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Economic Valuation Engine"
        title="VGIS Core Calculator & Government Procurement Simulator"
        subtitle="The baseline conversion table underpinning every VGIS point in the system, and the live tender-scoring formula that rewards verified civic contribution."
      />

      <Card className="overflow-x-auto">
        <div className="text-white font-semibold mb-4">Economic Valuation Baseline Grid</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-white/10">
              <th className="py-2 pr-4">Activity</th>
              <th className="py-2 pr-4 text-right">USD Equivalent</th>
              <th className="py-2 text-right">VGIS Points</th>
            </tr>
          </thead>
          <tbody>
            {VALUATION_BASELINE.map((row) => (
              <tr key={row.activity} className="border-b border-white/5">
                <td className="py-3 pr-4 text-gray-200">{row.activity}</td>
                <td className="py-3 pr-4 text-right text-[#10B981] font-medium">{fmtUSD(row.usd)}</td>
                <td className="py-3 text-right text-[#F59E0B] font-semibold">{row.points.toFixed(1)} pts</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ProcurementSimulator />
    </div>
  );
}

/* -------------------------------------------------------------------------
 * TAB 4 — Phase-1 Priority Projects Tracker
 * ---------------------------------------------------------------------- */

function LaborBreakdownBar({ label, pct, colorClass }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span className="text-white font-medium">{pct}%</span>
      </div>
      <ProgressBar pct={pct} colorClass={colorClass} />
    </div>
  );
}

function ProjectsTab() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Phase-1 Implementation"
        title="Priority Projects Tracker"
        subtitle="Live milestone progress across Laascaanood's two flagship Phase-1 infrastructure corridors."
      />

      {/* Sub-project 1 */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#F59E0B]/15 p-2 text-[#F59E0B]">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Sub-Project 1</div>
              <div className="text-lg font-bold text-white">Laascaanood Airport Building &amp; Runway Rehabilitation</div>
            </div>
          </div>
          <span className="rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-semibold px-3 py-1">In Progress — 61%</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-[#F59E0B]" /> Runway Leveling (2.4 km)</span>
                <span className="text-white font-medium">72%</span>
              </div>
              <ProgressBar pct={72} />
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span className="flex items-center gap-1.5"><Fence className="h-3.5 w-3.5 text-[#F59E0B]" /> Security Fence (6 km)</span>
                <span className="text-white font-medium">54%</span>
              </div>
              <ProgressBar pct={54} />
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span className="flex items-center gap-1.5"><Sun className="h-3.5 w-3.5 text-[#F59E0B]" /> Solar Night-Landing Lights</span>
                <span className="text-white font-medium">38%</span>
              </div>
              <ProgressBar pct={38} />
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-[#F59E0B]" /> Modular Passenger Terminal</span>
                <span className="text-white font-medium">46%</span>
              </div>
              <ProgressBar pct={46} />
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-white mb-3">Division of Labor</div>
            <div className="space-y-3">
              <LaborBreakdownBar label="Citizens" pct={28} colorClass="bg-[#10B981]" />
              <LaborBreakdownBar label="Contractors" pct={40} colorClass="bg-[#F59E0B]" />
              <LaborBreakdownBar label="Students" pct={14} colorClass="bg-sky-400" />
              <LaborBreakdownBar label="Diaspora (Sponsorship)" pct={18} colorClass="bg-purple-400" />
            </div>
          </div>
        </div>
      </Card>

      {/* Sub-project 2 */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#F59E0B]/15 p-2 text-[#F59E0B]">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Sub-Project 2</div>
              <div className="text-lg font-bold text-white">Laascaanood–Kalabaydh Highway Corridor &amp; Urban Access Network</div>
            </div>
          </div>
          <span className="rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-semibold px-3 py-1">In Progress — 47%</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>30 km DBST Surface Treatment</span>
              <span className="text-white font-medium">14.1 / 30 km</span>
            </div>
            <ProgressBar pct={(14.1 / 30) * 100} />
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Reinforced Box Culverts</span>
              <span className="text-white font-medium">9 / 16 installed</span>
            </div>
            <ProgressBar pct={(9 / 16) * 100} colorClass="bg-[#F59E0B]" />
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-1">
              <span>Interlocking Cobblestone (Student Brigades)</span>
              <span className="text-white font-medium">3.2 / 5 km</span>
            </div>
            <ProgressBar pct={(3.2 / 5) * 100} colorClass="bg-sky-400" />
          </div>
        </div>

        <div className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Truck className="h-4 w-4 text-[#F59E0B]" /> Active Fleet / Equipment Tracker (Hobbs Meter Logged)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-white/10">
                <th className="py-2 pr-4">Unit ID</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Assigned Project</th>
                <th className="py-2 pr-4 text-right">Hobbs Hrs</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {FLEET.map((f) => (
                <tr key={f.id} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 font-mono text-xs text-gray-400">{f.id}</td>
                  <td className="py-2.5 pr-4 text-gray-200">{f.type}</td>
                  <td className="py-2.5 pr-4 text-gray-300">{f.project}</td>
                  <td className="py-2.5 pr-4 text-right text-white">{f.hobbsHrs.toFixed(1)}</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        f.status === "Active"
                          ? "bg-[#10B981]/15 text-[#10B981]"
                          : f.status === "Idle"
                          ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                          : "bg-gray-500/15 text-gray-300"
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * TAB 5 — Integrity Code, Audit & Anti-Fraud Engine
 * ---------------------------------------------------------------------- */

function IntegrityTab() {
  const [activeStep, setActiveStep] = useState(1);
  const [claimedPoints, setClaimedPoints] = useState(1200);
  const [multiplier, setMultiplier] = useState(3);
  const [alertLog, setAlertLog] = useState([]);

  const triggerAlert = () => {
    const deducted = claimedPoints * multiplier;
    const entry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      unit: "Grader #BUS-004",
      claimed: claimedPoints,
      multiplier,
      deducted,
    };
    setAlertLog((prev) => [entry, ...prev].slice(0, 6));
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Anti-Fraud Governance"
        title="Integrity Code, Audit & Anti-Fraud Engine"
        subtitle="The offense classification matrix, due-process appeals workflow, and automated point clawback logic protecting the integrity of the VGIS ledger."
      />

      <div className="grid md:grid-cols-3 gap-5">
        {OFFENSE_CLASSES.map((o) => (
          <Card key={o.cls} className={`border ${o.color}`}>
            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold mb-3 ${o.badge}`}>{o.cls}</span>
            <div className="text-white font-semibold">{o.title}</div>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{o.examples}</p>
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Penalty</span>
                <span className="text-white font-medium text-right">{o.penalty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Point Clawback</span>
                <span className="text-white font-medium">{o.clawback}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-2 text-white font-semibold text-lg mb-5">
          <ClipboardList className="h-5 w-5 text-[#F59E0B]" /> Notice of Violation (NOV) &amp; Appeals Workflow
        </div>
        <div className="flex flex-col md:flex-row md:items-stretch gap-2">
          {WORKFLOW_STEPS.map((s, idx) => (
            <React.Fragment key={s.step}>
              <button
                onClick={() => setActiveStep(s.step)}
                className={`flex-1 text-left rounded-xl border p-4 transition ${
                  activeStep === s.step
                    ? "border-[#F59E0B] bg-[#F59E0B]/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <s.icon className={`h-4 w-4 ${activeStep === s.step ? "text-[#F59E0B]" : "text-gray-400"}`} />
                  <span className="text-xs font-semibold text-gray-400">STEP {s.step}</span>
                </div>
                <div className={`text-sm font-semibold ${activeStep === s.step ? "text-white" : "text-gray-300"}`}>{s.title}</div>
              </button>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div className="hidden md:flex items-center justify-center text-gray-600">
                  <ChevronRight className="h-5 w-5" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-[#0F172A] border border-white/10 p-4 text-sm text-gray-300">
          {WORKFLOW_STEPS.find((s) => s.step === activeStep)?.desc}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-white font-semibold text-lg mb-1">
          <AlertTriangle className="h-5 w-5 text-red-400" /> Live Fraud Alert Simulation Tool
        </div>
        <p className="text-sm text-gray-400 mb-5">
          Points Deducted = Fraudulent Claimed Points × Penalty Multiplier
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Fraudulently Claimed Points</span>
                <span className="text-white font-semibold">{fmtNum(claimedPoints)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={20000}
                step={50}
                value={claimedPoints}
                onChange={(e) => setClaimedPoints(Number(e.target.value))}
                className="w-full accent-red-400"
              />
            </div>
            <div>
              <div className="text-sm text-gray-300 mb-2">Penalty Multiplier (Offense Class)</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "3x (Class B min)", value: 3 },
                  { label: "5x (Class B max)", value: 5 },
                  { label: "100% Wipeout (Class C)", value: 100 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMultiplier(opt.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                      multiplier === opt.value
                        ? "bg-red-500 text-white border-red-500"
                        : "border-white/15 text-gray-300 hover:border-red-400/60"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={triggerAlert}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500 text-white font-semibold py-2.5 hover:bg-red-500/90 transition"
            >
              <Radio className="h-4 w-4" /> Trigger Mock Audit Flag — Hobbs Meter Spike, Grader #BUS-004
            </button>
          </div>

          <div>
            <div className="rounded-xl bg-[#0F172A] border border-red-500/30 p-4 mb-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Points to be Deducted (Live Preview)</div>
              <div className="text-3xl font-bold text-red-400 mt-1">
                {fmtNum(Math.min(claimedPoints * multiplier, claimedPoints * 100))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {fmtNum(claimedPoints)} pts × {multiplier === 100 ? "100% wipeout" : `${multiplier}x`}
              </div>
            </div>

            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Alert Log</div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {alertLog.length === 0 && (
                <div className="text-xs text-gray-600 italic">No alerts triggered yet.</div>
              )}
              {alertLog.map((a) => (
                <div key={a.id} className="flex items-start gap-2 rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2 text-xs">
                  <FileWarning className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-gray-300">
                      <span className="text-white font-medium">{a.unit}</span> — {a.time}
                    </div>
                    <div className="text-gray-500">
                      Claimed {fmtNum(a.claimed)} pts × {a.multiplier === 100 ? "100%" : `${a.multiplier}x`} ={" "}
                      <span className="text-red-400 font-semibold">{fmtNum(a.deducted)} pts clawed back</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Root Dashboard
 * ---------------------------------------------------------------------- */

export default function ProjectWadaniDashboard() {
  const [activeTab, setActiveTab] = useState("townhall");
  const [volunteers, setVolunteers] = useState(() => loadJSON(STORAGE_KEYS.volunteers, SEED_VOLUNTEERS));
  const [attendance, setAttendance] = useState(() => loadJSON(STORAGE_KEYS.attendance, []));
  const [adminSession, setAdminSession] = useState(() => loadJSON(STORAGE_KEYS.session, null));
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => saveJSON(STORAGE_KEYS.volunteers, volunteers), [volunteers]);
  useEffect(() => saveJSON(STORAGE_KEYS.attendance, attendance), [attendance]);
  useEffect(() => saveJSON(STORAGE_KEYS.session, adminSession), [adminSession]);

  const isAdmin = !!adminSession;

  const handleLogin = (username, password) => {
    const match = ADMINS.find((a) => a.username === username && a.password === password);
    if (!match) return false;
    setAdminSession({ username: match.username, name: match.name, role: match.role, loginTime: Date.now() });
    return true;
  };

  const handleVerify = (id) => {
    setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, status: "Verified" } : v)));
  };

  const handleMarkAttendance = (volunteerId, volunteerName, status) => {
    if (!adminSession) return;
    const today = todayStr();
    const time = new Date().toLocaleTimeString();
    setAttendance((prev) => {
      const idx = prev.findIndex((a) => a.volunteerId === volunteerId && a.date === today);
      const entry = {
        id: idx >= 0 ? prev[idx].id : `${Date.now()}-${volunteerId}`,
        volunteerId,
        volunteerName,
        date: today,
        status,
        time,
        markedBy: adminSession.name,
      };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [entry, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-200">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0F172A]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#F59E0B]/15 p-2.5 text-[#F59E0B]">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  North East State of Somalia
                </div>
                <div className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  PROJECT WADANI <span className="text-[#F59E0B]">· VGIS</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <MetricTile icon={HandCoins} label="VGIS Capital Raised" value={fmtUSD(4820000)} />
              <MetricTile icon={Users} label="Active Volunteers" value={fmtNum(6540)} accent="text-[#10B981]" />
              <MetricTile icon={Route} label="Kilometers Paved" value="14.1 km" />
              <MetricTile icon={Plane} label="Runway Completion" value="61%" accent="text-[#10B981]" />
              <AdminControl
                adminSession={adminSession}
                onLoginClick={() => setLoginModalOpen(true)}
                onLogout={() => setAdminSession(null)}
              />
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-2 border-t border-white/5 pt-4">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[#F59E0B] text-[#0F172A]"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {activeTab === "townhall" && <TownHallTab />}
        {activeTab === "registry" && (
          <RegistryTab
            volunteers={volunteers}
            isAdmin={isAdmin}
            onRegister={(v) => setVolunteers((prev) => [v, ...prev])}
            onVerify={handleVerify}
          />
        )}
        {activeTab === "attendance" && (
          <AttendanceTab volunteers={volunteers} attendance={attendance} isAdmin={isAdmin} onMark={handleMarkAttendance} />
        )}
        {activeTab === "vgis" && <VGISCalculatorTab />}
        {activeTab === "projects" && <ProjectsTab />}
        {activeTab === "integrity" && <IntegrityTab />}
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        <div>PROJECT WADANI · Laascaanood Civic Infrastructure &amp; Volunteer Grading System — North East State of Somalia</div>
        <div className="mt-1.5 text-[11px] text-gray-600">
          © 2026 Ali Suleiman Ali. All rights reserved. Created and copyrighted by Ali Suleiman Ali.
        </div>
      </footer>

      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} onLogin={handleLogin} />
    </div>
  );
}
