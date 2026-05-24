require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err.message);
});

async function connectDB() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT current_database() AS database");
    console.log(`PostgreSQL connected to database: ${rows[0].database}`);
    return pool;
  } finally {
    client.release();
  }
}

module.exports = { pool, connectDB };
