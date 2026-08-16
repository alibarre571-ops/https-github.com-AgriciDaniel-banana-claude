const express = require("express");
const { pool } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

const CATEGORY_LABELS = {
  citizens: "Ordinary Citizens",
  business: "Registered Businesses",
  diaspora: "Diaspora Community",
  education: "Educational Institutions / Students",
  government: "Government Workers / Experts",
};
const MODALITIES = ["Labor", "Equipment", "Fuel", "Cash", "Expert Advisory"];

function toCamel(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    entityType: row.entity_type,
    modality: row.modality,
    logHistory: row.log_history,
    valueUSD: Number(row.value_usd),
    points: Number(row.points),
    phone: row.phone,
    district: row.district,
    status: row.status,
    dateRegistered: row.date_registered instanceof Date
      ? row.date_registered.toISOString().slice(0, 10)
      : row.date_registered,
  };
}

router.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM volunteers ORDER BY created_at DESC");
  res.json(rows.map(toCamel));
});

router.post("/", async (req, res) => {
  const { name, category, modality, quantity, unitValue, phone, district, entityType } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "name is required" });
  }
  if (!CATEGORY_LABELS[category]) {
    return res.status(400).json({ error: "invalid category" });
  }
  if (!MODALITIES.includes(modality)) {
    return res.status(400).json({ error: "invalid modality" });
  }

  const qty = Number(quantity) || 0;
  const unit = Number(unitValue) || 0;
  if (qty < 0 || unit < 0) {
    return res.status(400).json({ error: "quantity and unitValue must be non-negative" });
  }
  const estimatedValue = qty * unit;
  const unitLabel = modality === "Labor" || modality === "Expert Advisory" ? "hrs" : "units";

  const id = `VGIS-LS-2026-${Math.floor(1000 + Math.random() * 8999)}`;
  const logHistory = `Self-registered: ${qty} ${unitLabel} pending field verification`;

  const { rows } = await pool.query(
    `INSERT INTO volunteers (id, name, category, entity_type, modality, log_history, value_usd, points, phone, district, status, date_registered)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Pending Verification', CURRENT_DATE)
     RETURNING *`,
    [
      id,
      name.trim(),
      category,
      entityType || CATEGORY_LABELS[category],
      modality,
      logHistory,
      estimatedValue,
      estimatedValue,
      (phone || "").trim(),
      district || null,
    ]
  );

  res.status(201).json(toCamel(rows[0]));
});

router.patch("/:id/verify", requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    "UPDATE volunteers SET status = 'Verified' WHERE id = $1 RETURNING *",
    [req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "volunteer not found" });
  }
  res.json(toCamel(rows[0]));
});

module.exports = router;
