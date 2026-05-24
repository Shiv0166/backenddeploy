const { pool } = require("../db");
const { mapUser } = require("../lib/mappers");

async function findByEmailOrUsername(emailOrUsername) {
  const value = (emailOrUsername || "").toLowerCase().trim();
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1 LIMIT 1`,
    [value]
  );
  return mapUser(rows[0]);
}

async function findOne(query) {
  if (query.username) {
    const { rows } = await pool.query(`SELECT * FROM users WHERE username = $1 LIMIT 1`, [
      query.username,
    ]);
    return mapUser(rows[0]);
  }

  if (query.$or) {
    const email = query.$or.find((c) => c.email)?.email;
    const username = query.$or.find((c) => c.username)?.username;
    return findByEmailOrUsername(email || username);
  }

  return null;
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return mapUser(rows[0]);
}

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, username, password)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name || "", data.email || null, data.username, data.password]
  );
  return mapUser(rows[0]);
}

async function find() {
  const { rows } = await pool.query(`SELECT * FROM users ORDER BY created_at DESC`);
  return rows.map(mapUser);
}

async function findByIdAndUpdate(id, data) {
  const { rows } = await pool.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         email = COALESCE($3, email),
         username = COALESCE($4, username),
         password = COALESCE($5, password),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.name ?? null,
      data.email ?? null,
      data.username ?? null,
      data.password ?? null,
    ]
  );
  return mapUser(rows[0]);
}

async function findByIdAndDelete(id) {
  const { rows } = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);
  return mapUser(rows[0]);
}

module.exports = {
  findOne,
  findById,
  find,
  create,
  findByEmailOrUsername,
  findByIdAndUpdate,
  findByIdAndDelete,
};
