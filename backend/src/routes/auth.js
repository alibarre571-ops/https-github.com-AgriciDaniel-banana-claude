const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const { rows } = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
  const admin = rows[0];
  if (!admin) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const payload = { username: admin.username, name: admin.name, role: admin.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });

  res.json({ token, ...payload });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json(req.admin);
});

module.exports = router;
