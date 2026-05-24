const { pool } = require("../db");
const { mapFoodItem } = require("../lib/mappers");

async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO food_items (name, description, price, category, image)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.name,
      data.description || "",
      data.price,
      data.category || "General",
      data.image || "",
    ]
  );
  return mapFoodItem(rows[0]);
}

async function find() {
  const { rows } = await pool.query(`SELECT * FROM food_items ORDER BY created_at DESC`);
  return rows.map(mapFoodItem);
}

async function findByIdAndUpdate(id, data) {
  const { rows } = await pool.query(
    `UPDATE food_items
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         price = COALESCE($4, price),
         category = COALESCE($5, category),
         image = COALESCE($6, image),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.name ?? null,
      data.description ?? null,
      data.price ?? null,
      data.category ?? null,
      data.image ?? null,
    ]
  );
  return mapFoodItem(rows[0]);
}

async function findByIdAndDelete(id) {
  const { rows } = await pool.query(`DELETE FROM food_items WHERE id = $1 RETURNING *`, [id]);
  return mapFoodItem(rows[0]);
}

module.exports = { create, find, findByIdAndUpdate, findByIdAndDelete };
