const express = require("express");
const { pool } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

const STATUSES = ["Present", "Late", "Absent"];

function toCamel(row) {
  return {
    id: row.id,
    volunteerId: row.volunteer_id,
    volunteerName: row.volunteer_name,
    date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date,
    status: row.status,
    time: row.time,
    markedBy: row.marked_by,
  };
}

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM attendance ORDER BY date DESC, created_at DESC LIMIT 200"
  );
  res.json(rows.map(toCamel));
});

router.post("/", requireAdmin, async (req, res) => {
  const { volunteerId, status } = req.body || {};
  if (!volunteerId || !STATUSES.includes(status)) {
    return res.status(400).json({ error: "volunteerId and a valid status are required" });
  }

  const volunteerResult = await pool.query("SELECT name FROM volunteers WHERE id = $1", [volunteerId]);
  const volunteer = volunteerResult.rows[0];
  if (!volunteer) {
    return res.status(404).json({ error: "volunteer not found" });
  }

  const time = new Date().toLocaleTimeString("en-US");

  const { rows } = await pool.query(
    `INSERT INTO attendance (volunteer_id, volunteer_name, date, status, time, marked_by)
     VALUES ($1, $2, CURRENT_DATE, $3, $4, $5)
     ON CONFLICT (volunteer_id, date)
     DO UPDATE SET status = EXCLUDED.status, time = EXCLUDED.time, marked_by = EXCLUDED.marked_by
     RETURNING *`,
    [volunteerId, volunteer.name, status, time, req.admin.name]
  );

  res.status(201).json(toCamel(rows[0]));
});

module.exports = router;
