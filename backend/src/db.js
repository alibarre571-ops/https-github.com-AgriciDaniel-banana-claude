const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);

const pool = new Pool({
  connectionString,
  // Render (and most managed Postgres hosts) terminate TLS with a
  // certificate that isn't in Node's default trust store. Localhost
  // dev databases don't use TLS at all.
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

module.exports = { pool };
