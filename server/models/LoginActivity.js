const { pool } = require("../db");

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO login_activities (user_id, user_email, ip, user_agent)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.userId, data.userEmail, data.ip || "", data.userAgent || ""]
  );
  return rows[0];
}

module.exports = { create };
