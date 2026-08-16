-- Project WADANI VGIS — database schema

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS volunteers (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  modality        TEXT NOT NULL,
  log_history     TEXT NOT NULL DEFAULT '',
  value_usd       NUMERIC NOT NULL DEFAULT 0,
  points          NUMERIC NOT NULL DEFAULT 0,
  phone           TEXT,
  district        TEXT,
  status          TEXT NOT NULL DEFAULT 'Pending Verification',
  date_registered DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance (
  id             SERIAL PRIMARY KEY,
  volunteer_id   TEXT NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  volunteer_name TEXT NOT NULL,
  date           DATE NOT NULL,
  status         TEXT NOT NULL,
  time           TEXT NOT NULL,
  marked_by      TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (volunteer_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance (date);
CREATE INDEX IF NOT EXISTS idx_volunteers_category ON volunteers (category);
