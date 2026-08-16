require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool } = require("./db");

const ADMINS = [
  { username: "alibarre", password: "571barre", name: "Ali Suleiman Ali", role: "Super Admin" },
];

const VOLUNTEERS = [
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

async function seed() {
  for (const a of ADMINS) {
    const hash = await bcrypt.hash(a.password, 10);
    await pool.query(
      `INSERT INTO admins (username, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, role = EXCLUDED.role`,
      [a.username, hash, a.name, a.role]
    );
  }
  console.log(`Seeded ${ADMINS.length} admin account(s).`);

  for (const v of VOLUNTEERS) {
    await pool.query(
      `INSERT INTO volunteers (id, name, category, entity_type, modality, log_history, value_usd, points, phone, district, status, date_registered)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [
        v.id, v.name, v.category, v.entityType, v.modality, v.logHistory,
        v.valueUSD, v.points, v.phone, v.district, v.status, v.dateRegistered,
      ]
    );
  }
  console.log(`Seeded ${VOLUNTEERS.length} volunteer record(s).`);

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
