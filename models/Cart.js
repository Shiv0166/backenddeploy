const { pool } = require("../db");
const { mapCart } = require("../lib/mappers");

async function loadCartItems(cartId) {
  const { rows } = await pool.query(
    `SELECT food_item_id, name, price, quantity, image, category
     FROM cart_items
     WHERE cart_id = $1`,
    [cartId]
  );
  return rows;
}

async function findOne({ userEmail }) {
  const email = (userEmail || "").toLowerCase().trim();
  const { rows } = await pool.query(`SELECT * FROM carts WHERE user_email = $1`, [email]);
  if (!rows[0]) return null;
  const items = await loadCartItems(rows[0].id);
  return mapCart(rows[0], items);
}

async function findOneAndUpdate(filter, update, options = {}) {
  const userEmail = (filter.userEmail || "").toLowerCase().trim();
  const userId = update.userId || null;
  const items = Array.isArray(update.items) ? update.items : [];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const cartResult = await client.query(
      `INSERT INTO carts (user_email, user_id)
       VALUES ($1, $2)
       ON CONFLICT (user_email)
       DO UPDATE SET user_id = EXCLUDED.user_id, updated_at = NOW()
       RETURNING *`,
      [userEmail, userId]
    );
    const cartId = cartResult.rows[0].id;

    await client.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);

    for (const item of items) {
      await client.query(
        `INSERT INTO cart_items (cart_id, food_item_id, name, price, quantity, image, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          cartId,
          Number(item.itemId ?? item.id ?? 0) || null,
          item.name,
          Number(item.price || 0),
          Math.max(Number(item.quantity || 1), 1),
          item.image || "",
          item.category || "General",
        ]
      );
    }

    await client.query("COMMIT");
    const cartItems = await loadCartItems(cartId);
    return mapCart(cartResult.rows[0], cartItems);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { findOne, findOneAndUpdate };
